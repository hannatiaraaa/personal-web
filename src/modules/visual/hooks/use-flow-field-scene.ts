'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three';
import { useInViewport } from '@/common/hooks/use-in-viewport';
import { usePageVisible } from '@/common/hooks/use-page-visible';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { buildVogelPool, MAX_RIPPLES, POOL_POINTS, POOL_POINTS_MOBILE } from '@/modules/visual/lib/flow-field';
import { createFragmentShader, createVertexShader } from '@/modules/visual/lib/flow-field-shaders';
import { intersectGroundPlane, unrotateY } from '@/modules/visual/lib/pointer-plane';
import { RippleQueue } from '@/modules/visual/lib/ripple-queue';

/** Fill cost scales with the square of this; 1.5 is already crisp. */
const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 640;
/** Slow spin. The moiré shimmer of the spiral arms comes from this alone. */
const DRIFT_PER_SECOND = 0.035;
const POINTER_EASING = 0.05;
const POINTER_ROLL = 0.1;
const POINT_SIZE = 22;
/** A still frame wants the swell mid-motion, not the flat start. */
const STILL_TIME = 7.3;

const CAMERA = {
  fov: 42,
  near: 0.1,
  far: 60,
  /** High enough that the arms read as a pattern, low enough to keep depth. */
  position: [0, 5.4, 9.6],
  target: [0, -0.4, 0],
} as const;

function readColour(element: HTMLElement, token: string, fallback: string): Color {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  return new Color(value || fallback);
}

function isDarkTheme(): boolean {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'dark') return true;
  if (chosen === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Runs the pool: one `Points` object over one static buffer, one draw call.
 *
 * Owns the WebGL lifecycle and the frame loop, and nothing else. The motion
 * fields are in `lib/flow-field`, the shader source in
 * `lib/flow-field-shaders`, the pointer geometry in `lib/pointer-plane` and the
 * ripple bookkeeping in `lib/ripple-queue` — so everything with a rule in it is
 * unit-tested, and this file is wiring.
 *
 * Two effects on purpose. The first builds the scene and must not re-run when
 * the hero scrolls past — rebuilding recompiles the shaders, recomputes the
 * pool and resets the clock, so the swell would jump backwards every time the
 * tab regained focus. The second only starts and stops the loop.
 *
 * The loop stops when the canvas leaves the viewport or the tab goes to the
 * background. Under reduced motion the water stands still and only a ripple the
 * visitor places redraws it: motion they asked for, not motion they asked to be
 * spared.
 */
export function useFlowFieldScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef, '200px');
  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

  const [pointCount, setPointCount] = useState(POOL_POINTS);

  // Read inside the loop, so a visibility change never rebuilds the scene.
  const animatingRef = useRef(shouldAnimate);
  animatingRef.current = shouldAnimate;
  const controlsRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      // No WebGL. The gradient placeholder behind the canvas stays visible.
      return;
    }
    renderer.setClearAlpha(0);

    const pool = buildVogelPool(window.innerWidth < MOBILE_BREAKPOINT ? POOL_POINTS_MOBILE : POOL_POINTS);
    setPointCount(pool.count);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(pool.positions, 3));
    geometry.setAttribute('aRadius', new BufferAttribute(pool.radius, 1));

    // x, z, birth time, live flag — one vec4 per slot, read by the shader loop.
    const ripples = Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 0, 0, 0));

    const material = new ShaderMaterial({
      vertexShader: createVertexShader(),
      fragmentShader: createFragmentShader(),
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: STILL_TIME },
        uSize: { value: POINT_SIZE },
        uPixelRatio: { value: 1 },
        uRipples: { value: ripples },
        uColorDeep: { value: new Color() },
        uColorBright: { value: new Color() },
        uOpacity: { value: 1 },
      },
    });

    const points = new Points(geometry, material);
    const scene = new Scene();
    scene.add(points);

    const camera = new PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    camera.position.set(...CAMERA.position);
    camera.lookAt(...CAMERA.target);

    let clock = STILL_TIME;
    const queue = new RippleQueue();
    const pointer = { roll: 0, targetRoll: 0 };

    const render = () => renderer.render(scene, camera);

    const applyTheme = () => {
      const dark = isDarkTheme();
      // The ramp runs quiet → energetic, and energy has to gain contrast against
      // its ground: over the dark one it glows brighter (additive cyan), over
      // the light one it draws in darker ink. Same ramp, opposite ends — added
      // light on white only goes to white, which lost the crest entirely.
      material.uniforms.uColorDeep!.value = dark
        ? readColour(canvas, '--sky-mid', '#22b8e6')
        : readColour(canvas, '--sky-low', '#7dd3fc');
      material.uniforms.uColorBright!.value = dark
        ? readColour(canvas, '--signal-cyan', '#22d3ee')
        : readColour(canvas, '--signal', '#0369a1');
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.uniforms.uOpacity!.value = dark ? 0.92 : 0.95;
      material.needsUpdate = true;
    };

    /** Re-reads the tokens and repaints, for a theme change with the loop stopped. */
    const applyThemeAndRepaint = () => {
      applyTheme();
      render();
    };

    applyTheme();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { clientWidth, clientHeight } = canvas;
      if (!clientWidth || !clientHeight) return;

      renderer.setPixelRatio(dpr);
      renderer.setSize(clientWidth, clientHeight, false);
      material.uniforms.uPixelRatio!.value = dpr;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      // setSize resets the drawing buffer, and ResizeObserver fires once on
      // observe(), so without this the pool blanks itself on mount whenever the
      // loop is not already running.
      render();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(applyThemeAndRepaint);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', applyThemeAndRepaint);

    const drop = (event: PointerEvent, rect: DOMRect, deliberate: boolean) => {
      const ndc = new Vector3(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        0.5,
      ).unproject(camera);

      const ground = intersectGroundPlane(camera.position, ndc.sub(camera.position).normalize());
      if (!ground) return;

      const slot = queue.place(unrotateY(ground, points.rotation.y), deliberate);
      if (!slot) return;

      ripples[slot.index]!.set(slot.x, slot.z, clock, 1);

      // Standing still: the placed ripple is the only reason to repaint.
      if (!animatingRef.current) {
        material.uniforms.uTime!.value = clock;
        render();
      }
    };

    const onPointerDown = (event: PointerEvent) => drop(event, canvas.getBoundingClientRect(), true);

    const onPointerMove = (event: PointerEvent) => {
      // One layout read per move, shared by the roll and the ripple.
      const rect = canvas.getBoundingClientRect();
      pointer.targetRoll = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      if (!reducedMotion) drop(event, rect, false);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);

    let frameHandle = 0;
    let lastTime = 0;

    const renderFrame = (now: number) => {
      const elapsed = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;
      clock += elapsed;

      material.uniforms.uTime!.value = clock;
      pointer.roll += (pointer.targetRoll - pointer.roll) * POINTER_EASING;
      points.rotation.y += elapsed * DRIFT_PER_SECOND;
      points.rotation.z = pointer.roll * POINTER_ROLL;

      render();
      frameHandle = requestAnimationFrame(renderFrame);
    };

    const controls = {
      start: () => {
        if (frameHandle) return;
        // A fresh baseline, or the first frame after a pause would advance the
        // clock by however long the page sat idle.
        lastTime = 0;
        frameHandle = requestAnimationFrame(renderFrame);
      },
      stop: () => {
        if (frameHandle) cancelAnimationFrame(frameHandle);
        frameHandle = 0;
      },
    };

    controlsRef.current = controls;
    render();

    return () => {
      controls.stop();
      controlsRef.current = null;
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyThemeAndRepaint);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef, reducedMotion]);

  // Starting and stopping is all this one does — the scene outlives it.
  useEffect(() => {
    if (shouldAnimate) controlsRef.current?.start();
    else controlsRef.current?.stop();
  }, [shouldAnimate]);

  return { reducedMotion, pointCount };
}
