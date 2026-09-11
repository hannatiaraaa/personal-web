'use client';

import { useEffect, useState, type RefObject } from 'react';
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
import { buildVogelPool, POOL_POINTS, POOL_POINTS_MOBILE } from '@/modules/visual/lib/flow-field';

/** Fill cost scales with the square of this; 1.5 is already crisp. */
const MAX_DPR = 1.5;
const MOBILE_BREAKPOINT = 640;
/** Slow spin. The moiré shimmer of the spiral arms comes from this alone. */
const DRIFT_PER_SECOND = 0.035;
const POINTER_EASING = 0.05;
const POINTER_TILT = 0.1;
/** Concurrent ripples. A fifth touch recycles the oldest. */
const MAX_RIPPLES = 4;
/** Metres of pointer travel between free ripples while moving. */
const RIPPLE_SPACING = 1.1;
/** A still frame wants the swell mid-motion, not the flat start. */
const STILL_TIME = 7.3;

/**
 * One `Points` object, one static buffer, one draw call. Per frame the CPU
 * sends a clock and four ripple records; everything else — swell, front,
 * ripples, colour — happens in the vertex shader. No lights, no textures, no
 * post-processing: none of it is needed, and all of it is what makes three.js
 * heavy.
 *
 * The three motion fields are ports of `swellHeight`, `frontPulse` and
 * `rippleHeight` in `lib/flow-field.ts`. GLSL cannot call TypeScript, so they
 * exist twice; the TypeScript versions are the tested ones and these must be
 * changed with them.
 */
const vertexShader = /* glsl */ `
  attribute float aRadius;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec4 uRipples[4];

  varying float vIntensity;
  varying float vRadius;
  varying float vDepth;

  // Port of swellHeight().
  float swellHeight(vec2 p, float time) {
    return 0.62 * sin(0.75 * p.x + 0.9 * time)
         + 0.34 * sin(0.52 * p.y - 1.18 * time + 1.7)
         + 0.22 * sin(0.41 * (p.x + p.y) + 0.64 * time + 3.1);
  }

  // Port of frontPulse() — the moving edge of a harvested Fisher-Kolmogorov
  // invasion: the gradient of the sigmoid profile, scaled by 1 - harvest.
  float frontPulse(float radius, float time) {
    float phase = fract(time / 9.0);
    float reach = phase * 1.5 - 0.12;
    float envelope = smoothstep(0.0, 0.12, phase) * (1.0 - smoothstep(0.8, 1.0, phase));
    float sigmoid = 1.0 / (1.0 + exp(9.0 * (radius - reach)));
    return 0.65 * 4.0 * sigmoid * (1.0 - sigmoid) * envelope;
  }

  // Port of rippleHeight() — expanding ring, decaying in space and time, gated
  // so it cannot appear ahead of its own travel.
  float rippleHeight(float distance, float age) {
    if (age <= 0.0 || age > 3.5) return 0.0;
    float travel = age * 2.2;
    float causal = 1.0 - smoothstep(travel, travel + 0.6, distance);
    return 0.32 * sin(5.5 * distance - 9.0 * age)
         * exp(-distance / 1.4) * exp(-age / 1.1) * causal;
  }

  void main() {
    float swell = swellHeight(position.xz, uTime);
    float front = frontPulse(aRadius, uTime);

    float ripples = 0.0;
    for (int i = 0; i < 4; i++) {
      vec4 drop = uRipples[i];
      if (drop.w < 0.5) continue;
      ripples += rippleHeight(distance(position.xz, drop.xy), uTime - drop.z);
    }

    // The swell eases toward the rim so the pool feathers instead of shearing.
    float rim = 1.0 - smoothstep(0.55, 1.0, aRadius) * 0.45;
    float height = swell * 0.62 * rim + front * 0.9 + ripples;

    vec3 displaced = vec3(position.x, height, position.z);
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // Colour: lifted by height, and the front ring glows as it passes.
    float heightNorm = height * 0.5 + 0.5;
    vIntensity = clamp(0.3 + 0.6 * heightNorm + 0.9 * front + 1.6 * abs(ripples), 0.0, 1.0);
    vRadius = aRadius;
    vDepth = clamp((-viewPosition.z - 6.0) / 12.0, 0.0, 1.0);

    gl_PointSize = uSize * uPixelRatio * (1.0 / -viewPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorDeep;
  uniform vec3 uColorBright;
  uniform float uOpacity;

  varying float vIntensity;
  varying float vRadius;
  varying float vDepth;

  void main() {
    // Soft round dot from the point's own coordinates — cheaper than a texture.
    float distanceToCentre = length(gl_PointCoord - vec2(0.5));
    if (distanceToCentre > 0.5) discard;
    float falloff = smoothstep(0.5, 0.06, distanceToCentre);

    vec3 colour = mix(uColorDeep, uColorBright, vIntensity);
    // The rim feathers to nothing, so the pool has no hard edge,
    // and far points recede without a fog pass.
    float edge = 1.0 - smoothstep(0.82, 1.0, vRadius);
    float depthFade = mix(1.0, 0.55, vDepth);

    gl_FragColor = vec4(colour, falloff * uOpacity * edge * depthFade);
  }
`;

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
 * Renders the pool and owns its frame loop.
 *
 * The loop stops when the canvas leaves the viewport or the tab goes to the
 * background. Under reduced motion it draws one settled frame and only redraws
 * when a ripple is placed by hand — motion the visitor asked for, not ambient
 * motion they asked to be spared.
 */
export function useFlowFieldScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef, '200px');
  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

  const [pointCount, setPointCount] = useState(POOL_POINTS);

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

    const count = window.innerWidth < MOBILE_BREAKPOINT ? POOL_POINTS_MOBILE : POOL_POINTS;
    const pool = buildVogelPool(count);
    setPointCount(pool.count);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(pool.positions, 3));
    geometry.setAttribute('aRadius', new BufferAttribute(pool.radius, 1));

    const ripples = Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 0, 0, 0));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: STILL_TIME },
        uSize: { value: 22 },
        uPixelRatio: { value: 1 },
        uRipples: { value: ripples },
        uColorDeep: { value: new Color('#0284c7') },
        uColorBright: { value: new Color('#22d3ee') },
        uOpacity: { value: 0.9 },
      },
    });

    const points = new Points(geometry, material);
    const scene = new Scene();
    scene.add(points);

    // High enough that the spiral arms read as a pattern, low enough that the
    // swell reads as depth. One framing; nothing re-aims.
    const camera = new PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 5.4, 9.6);
    camera.lookAt(0, -0.4, 0);

    const applyTheme = () => {
      const dark = isDarkTheme();
      // The ramp runs quiet → energetic, and energy must gain contrast against
      // the ground: on the dark ground it glows brighter (additive cyan), on
      // the light ground it draws in darker ink. Same ramp, opposite ends.
      if (dark) {
        material.uniforms.uColorDeep!.value = readColour(canvas, '--sky-mid', '#22b8e6');
        material.uniforms.uColorBright!.value = readColour(canvas, '--signal-cyan', '#22d3ee');
      } else {
        material.uniforms.uColorDeep!.value = readColour(canvas, '--sky-low', '#7dd3fc');
        material.uniforms.uColorBright!.value = readColour(canvas, '--signal', '#0369a1');
      }
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.uniforms.uOpacity!.value = dark ? 0.92 : 0.95;
      material.needsUpdate = true;
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
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', applyTheme);

    let clock = STILL_TIME;
    let nextRipple = 0;
    const lastDrop = { x: Infinity, z: Infinity };

    /** Pointer → the pool's own plane, through the camera and the spin. */
    const toPool = (event: PointerEvent): { x: number; z: number } | null => {
      const rect = canvas.getBoundingClientRect();
      const ndc = new Vector3(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        0.5,
      ).unproject(camera);

      const direction = ndc.sub(camera.position).normalize();
      if (Math.abs(direction.y) < 1e-4) return null;

      const t = -camera.position.y / direction.y;
      if (t <= 0) return null;

      const hitX = camera.position.x + direction.x * t;
      const hitZ = camera.position.z + direction.z * t;

      // The disc spins, so the hit rotates back into its space.
      const spin = -points.rotation.y;
      return {
        x: hitX * Math.cos(spin) - hitZ * Math.sin(spin),
        z: hitX * Math.sin(spin) + hitZ * Math.cos(spin),
      };
    };

    const drop = (event: PointerEvent, force: boolean) => {
      const hit = toPool(event);
      if (!hit) return;
      if (!force && Math.hypot(hit.x - lastDrop.x, hit.z - lastDrop.z) < RIPPLE_SPACING) return;

      ripples[nextRipple]!.set(hit.x, hit.z, clock, 1);
      nextRipple = (nextRipple + 1) % MAX_RIPPLES;
      lastDrop.x = hit.x;
      lastDrop.z = hit.z;

      if (reducedMotion) renderStill();
    };

    const onPointerDown = (event: PointerEvent) => drop(event, true);
    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = ((event.clientX - (canvas.getBoundingClientRect().left ?? 0)) / canvas.clientWidth - 0.5) * 2;
      if (!reducedMotion) drop(event, false);
    };

    const pointer = { x: 0, targetX: 0 };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);

    let frameHandle = 0;
    let lastTime = 0;

    const renderFrame = (now: number) => {
      const elapsed = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;
      clock += elapsed;

      material.uniforms.uTime!.value = clock;
      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
      points.rotation.y += elapsed * DRIFT_PER_SECOND;
      points.rotation.z = pointer.x * POINTER_TILT;

      renderer.render(scene, camera);
      frameHandle = requestAnimationFrame(renderFrame);
    };

    /** Reduced motion: the world stands still; only a placed ripple redraws. */
    const renderStill = () => {
      material.uniforms.uTime!.value = clock;
      renderer.render(scene, camera);
    };

    if (shouldAnimate) {
      frameHandle = requestAnimationFrame(renderFrame);
    } else {
      renderStill();
    }

    return () => {
      if (frameHandle) cancelAnimationFrame(frameHandle);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyTheme);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef, shouldAnimate, reducedMotion]);

  return { reducedMotion, pointCount };
}
