'use client';

// Client: a hook — React state and effects, used only by client components.

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
import {
  approachValue,
  introCameraScale,
  mapScrollToFlowField,
  parseSceneProgress,
  pullCamera,
  SCROLL_RESPONSE,
} from '@/modules/visual/lib/flow-field-scroll';
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
const PARALLEL_COMPILE = 'KHR_parallel_shader_compile';

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
 * Runs the pool: one `Points` object, one static buffer, one draw call. This
 * file is wiring; every rule lives in a tested `lib/` module.
 *
 * Two effects on purpose: the first builds the scene and must not re-run when
 * the loop pauses (it would recompile shaders and reset the clock, so the swell
 * jumps back); the second only starts and stops the loop. The loop stops off
 * screen or in a background tab. Under reduced motion the water stands still
 * and only a ripple the visitor places redraws it.
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
        uSwellGain: { value: 1 },
        uDisturbance: { value: 0 },
      },
    });

    const points = new Points(geometry, material);
    const scene = new Scene();
    scene.add(points);

    const camera = new PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);

    // The camera follows the scene's `--progress`, read per frame rather than
    // through a listener of its own. Reduced motion is the finished scene.
    const sceneElement = canvas.closest<HTMLElement>('[data-scene]');
    const readProgress = () =>
      reducedMotion || !sceneElement ? 1 : parseSceneProgress(sceneElement.style.getPropertyValue('--progress'));
    const placeCamera = (progress: number) => {
      camera.position.set(...pullCamera(CAMERA.position, CAMERA.target, introCameraScale(progress)));
      camera.lookAt(...CAMERA.target);
    };
    placeCamera(readProgress());

    let clock = STILL_TIME;
    const queue = new RippleQueue();
    const pointer = { roll: 0, targetRoll: 0 };
    // Starts at rest, so a reduced-motion still frame is the calm one.
    const response = { ...mapScrollToFlowField(0) };

    // Nothing draws until the shaders compile. Where the driver supports
    // parallel compile it happens off the main thread, so the first frame is not
    // one long task mid-hydration; elsewhere the first render compiles them.
    let isCompiled = false;
    let isDisposed = false;
    const render = () => {
      if (isCompiled) renderer.render(scene, camera);
    };

    const applyTheme = () => {
      const dark = isDarkTheme();
      // Energy must gain contrast against the ground: brighter additive cyan on
      // dark, darker ink on light (added light on white only reaches white).
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

      const progress = readProgress();
      const target = mapScrollToFlowField(progress);
      response.disturbance = approachValue(response.disturbance, target.disturbance, SCROLL_RESPONSE.easing);
      response.swellGain = approachValue(response.swellGain, target.swellGain, SCROLL_RESPONSE.easing);
      response.tilt = approachValue(response.tilt, target.tilt, SCROLL_RESPONSE.easing);
      material.uniforms.uDisturbance!.value = response.disturbance;
      material.uniforms.uSwellGain!.value = response.swellGain;
      points.rotation.x = response.tilt;
      placeCamera(progress);

      render();
      frameHandle = requestAnimationFrame(renderFrame);
    };

    const controls = {
      start: () => {
        if (frameHandle || !isCompiled) return;
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
    const compiled = renderer.extensions.has(PARALLEL_COMPILE)
      ? renderer.compileAsync(scene, camera)
      : Promise.resolve(scene);
    compiled
      .catch(() => undefined)
      .then(() => {
        if (isDisposed) return;
        isCompiled = true;
        render();
        if (animatingRef.current) controls.start();
      });

    return () => {
      isDisposed = true;
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
