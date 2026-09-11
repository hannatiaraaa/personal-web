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
  WebGLRenderer,
} from 'three';
import { useInViewport } from '@/common/hooks/use-in-viewport';
import { usePageVisible } from '@/common/hooks/use-page-visible';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { buildLifePathGeometry, POINT_COUNT, stageAtTime, SWELL_AMPLITUDE } from '@/modules/visual/lib/life-path';

/** Fill cost scales with the square of this, and 1.5 is already crisp. */
const MAX_DPR = 1.5;
/** Fewer points on a phone: same shape, a third of the fragments. */
const MOBILE_LATTICE = 92;
const MOBILE_BREAKPOINT = 640;
const FRONT_AMPLITUDE = 2.45;
const HARVEST = 0.35;
const DRIFT_PER_SECOND = 0.055;
const POINTER_EASING = 0.05;
const POINTER_TILT = 0.16;
/** A still frame wants a stage that reads, not a half-morph. */
const STILL_STAGE = 2;
const STILL_TIME = 9;

/**
 * One `Points` object, one buffer set, one draw call. No lights, no textures,
 * no shadow pass, no post-processing — none of it is needed to draw three
 * functions, and all of it is what makes three.js expensive.
 *
 * The two time-dependent fields below are ports of `fisherFront` and
 * `swellHeight` in `lib/life-path.ts`. A vertex shader cannot call TypeScript,
 * so they are written twice; the TypeScript versions are the tested ones and
 * these must be changed with them.
 */
const vertexShader = /* glsl */ `
  attribute vec3 aHelix;
  attribute float aRadius;
  attribute float aRole;

  uniform float uTime;
  uniform float uStage;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uHarvest;
  uniform float uFrontAmplitude;
  uniform float uSwellAmplitude;

  varying float vIntensity;
  varying float vDepth;

  // Port of frontAt() — Fisher-Kolmogorov travelling front, harvested, sweeping
  // outward on a loop so it reads as a front rather than settling flat.
  float frontAt(float radius, float time, float harvest) {
    float plateau = max(0.0, 1.0 - harvest);
    float phase = fract(time / 7.2);
    float reach = phase * 1.5 - 0.12;
    float envelope = smoothstep(0.0, 0.1, phase) * (1.0 - smoothstep(0.82, 1.0, phase));
    return plateau / (1.0 + exp(7.0 * (radius - reach))) * envelope;
  }

  // Port of swellHeight() — three sinusoids at different headings.
  float swellHeight(vec2 p, float time) {
    return 0.62 * sin(0.75 * p.x + 0.9 * time)
         + 0.34 * sin(0.52 * p.y - 1.18 * time + 1.7)
         + 0.22 * sin(0.41 * (p.x + p.y) + 0.64 * time + 3.1);
  }

  // Tent weight on a cycle of three, eased. At a whole stage exactly one
  // weight is 1; mid-transition two adjacent weights share it.
  float stageWeight(float stage, float target) {
    float distance = abs(stage - target);
    distance = min(distance, 3.0 - distance);
    return smoothstep(0.0, 1.0, max(0.0, 1.0 - distance));
  }

  void main() {
    float front = frontAt(aRadius, uTime, uHarvest);
    float swell = swellHeight(position.xz, uTime);
    float plateau = max(0.0001, 1.0 - uHarvest);

    vec3 pFront = vec3(position.x, front * uFrontAmplitude, position.z);
    vec3 pHelix = aHelix;
    vec3 pSwell = vec3(position.x, swell, position.z);

    // The two strands are given different colours on purpose. Two helices half
    // a turn apart at the same pitch are visually one coil of double frequency;
    // colour is what makes the pair read as a pair. Base pairs sit between them.
    float helixIntensity = aRole < 0.5 ? 0.1 : (aRole < 1.5 ? 1.0 : 0.55);

    float w0 = stageWeight(uStage, 0.0);
    float w1 = stageWeight(uStage, 1.0);
    float w2 = stageWeight(uStage, 2.0);
    float total = max(0.0001, w0 + w1 + w2);

    vec3 morphed = (pFront * w0 + pHelix * w1 + pSwell * w2) / total;
    vIntensity =
      (front / plateau * w0 + helixIntensity * w1 + (swell / uSwellAmplitude * 0.5 + 0.5) * w2) / total;

    vec4 viewPosition = modelViewMatrix * vec4(morphed, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    vDepth = clamp((-viewPosition.z - 5.0) / 16.0, 0.0, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / -viewPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorDeep;
  uniform vec3 uColorBright;
  uniform float uOpacity;

  varying float vIntensity;
  varying float vDepth;

  void main() {
    // Round soft dot from the point's own coordinates — cheaper than a texture.
    float distanceToCentre = length(gl_PointCoord - vec2(0.5));
    if (distanceToCentre > 0.5) discard;
    float falloff = smoothstep(0.5, 0.05, distanceToCentre);

    vec3 colour = mix(uColorDeep, uColorBright, clamp(vIntensity, 0.0, 1.0));
    // Far points recede, so the shape has depth without a fog pass.
    float depthFade = mix(1.0, 0.35, vDepth);

    gl_FragColor = vec4(colour, falloff * uOpacity * depthFade);
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

type Options = {
  /** A stage index to hold, or `null` to let the story play. */
  pinnedStage: number | null;
  /** Called on every stage change, so the legend can follow the shape. */
  onStageChange: (stage: number) => void;
};

/**
 * Renders the three shapes of the work — a harvested Fisher–Kolmogorov front, a
 * double helix, and ocean swell — as one morphing point cloud.
 *
 * The loop stops when the canvas leaves the viewport or the tab goes to the
 * background. Under reduced motion it draws a single still frame and returns.
 */
export function useLifePathScene(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef, '200px');
  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

  const [pointCount, setPointCount] = useState(POINT_COUNT);

  // Both are read from inside the frame loop, so they live in refs: changing a
  // pinned stage or swapping the callback must not tear down the WebGL context.
  const pinnedRef = useRef(options.pinnedStage);
  pinnedRef.current = options.pinnedStage;
  const onStageChangeRef = useRef(options.onStageChange);
  onStageChangeRef.current = options.onStageChange;

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

    const side = window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_LATTICE : undefined;
    const shape = buildLifePathGeometry(side);
    setPointCount(shape.count);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(shape.plane, 3));
    geometry.setAttribute('aHelix', new BufferAttribute(shape.helix, 3));
    geometry.setAttribute('aRadius', new BufferAttribute(shape.radius, 1));
    geometry.setAttribute('aRole', new BufferAttribute(shape.role, 1));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: STILL_TIME },
        uStage: { value: 0 },
        uSize: { value: 21 },
        uPixelRatio: { value: 1 },
        uHarvest: { value: HARVEST },
        uFrontAmplitude: { value: FRONT_AMPLITUDE },
        uSwellAmplitude: { value: SWELL_AMPLITUDE },
        uColorDeep: { value: new Color('#0284c7') },
        uColorBright: { value: new Color('#22d3ee') },
        uOpacity: { value: 0.85 },
      },
    });

    const points = new Points(geometry, material);
    const scene = new Scene();
    scene.add(points);

    // Looking down at roughly 28 degrees. Shallower and the plane reads as a
    // thin band with dead space above it; steeper and the helix stops reading as
    // vertical. One framing for all three shapes, so nothing re-aims mid-morph.
    const camera = new PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 5.2, 9.8);
    camera.lookAt(0, -0.1, 0);

    const applyTheme = () => {
      const dark = isDarkTheme();
      material.uniforms.uColorDeep!.value = readColour(canvas, dark ? '--sky-low' : '--signal', '#0284c7');
      material.uniforms.uColorBright!.value = readColour(canvas, '--signal-cyan', '#22d3ee');
      // Added light on white just goes to white, so additive glow is for the
      // dark ground only.
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.uniforms.uOpacity!.value = dark ? 0.9 : 0.95;
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

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    if (shouldAnimate) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      canvas.addEventListener('pointerleave', onPointerLeave);
    }

    let frameHandle = 0;
    let startTime = 0;
    let reportedStage = -1;

    const renderFrame = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;

      material.uniforms.uTime!.value = elapsed;

      const stage = pinnedRef.current ?? stageAtTime(elapsed);
      material.uniforms.uStage!.value = stage;

      const nearest = Math.round(stage) % 3;
      if (nearest !== reportedStage) {
        reportedStage = nearest;
        onStageChangeRef.current(nearest);
      }

      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;
      points.rotation.y = elapsed * DRIFT_PER_SECOND + pointer.x * POINTER_TILT;
      points.rotation.x = pointer.y * POINTER_TILT * 0.5;

      renderer.render(scene, camera);
      frameHandle = requestAnimationFrame(renderFrame);
    };

    if (shouldAnimate) {
      frameHandle = requestAnimationFrame(renderFrame);
    } else {
      // One settled frame: the swell, which reads as a shape without motion.
      material.uniforms.uTime!.value = STILL_TIME;
      material.uniforms.uStage!.value = pinnedRef.current ?? STILL_STAGE;
      onStageChangeRef.current(pinnedRef.current ?? STILL_STAGE);
      renderer.render(scene, camera);
    }

    return () => {
      if (frameHandle) cancelAnimationFrame(frameHandle);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyTheme);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef, shouldAnimate]);

  return { reducedMotion, pointCount };
}
