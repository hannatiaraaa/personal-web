'use client';

import { useEffect, type RefObject } from 'react';
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
import { buildHarmonicSurface, surfaceExtent } from '@/modules/visual/lib/spherical-harmonic';

const POINT_COUNT = 18_000;
/** WebGL fill cost scales with the square of this, and 1.5 is already crisp. */
const MAX_DPR = 1.5;
const ROTATION_PER_SECOND = 0.12;
const POINTER_EASING = 0.06;
const POINTER_TILT = 0.28;
const CAMERA_FIT = 3.1;

/**
 * One draw call: a single `Points` object over one buffer, drawn by a shader
 * with no lights, no textures and no shadow pass. Everything that makes
 * three.js expensive is left out, because none of it is needed to draw a
 * function.
 */
const vertexShader = /* glsl */ `
  attribute float intensity;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vIntensity;

  void main() {
    vIntensity = intensity;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    // Perspective attenuation, so near points read as nearer.
    gl_PointSize = uSize * uPixelRatio * (1.0 / -viewPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLowColor;
  uniform vec3 uHighColor;
  uniform float uOpacity;
  varying float vIntensity;

  void main() {
    // Soft round dot from the point's own coordinates — cheaper than a texture.
    float distanceToCentre = length(gl_PointCoord - vec2(0.5));
    if (distanceToCentre > 0.5) discard;
    float falloff = smoothstep(0.5, 0.08, distanceToCentre);

    vec3 colour = mix(uLowColor, uHighColor, vIntensity);
    gl_FragColor = vec4(colour, falloff * uOpacity);
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
 * Additive blending is what makes a point cloud glow, and it only works over a
 * dark ground — added light on white just goes to white, which is how the
 * surface lost its contrast in light mode. So the blend mode follows the theme:
 * additive at night, normal by day with a touch more opacity to compensate.
 */
function applyBlending(material: ShaderMaterial): void {
  const dark = isDarkTheme();
  material.blending = dark ? AdditiveBlending : NormalBlending;
  material.uniforms.uOpacity!.value = dark ? 0.85 : 0.95;
  material.needsUpdate = true;
}

/**
 * Renders a spherical harmonic point cloud into the given canvas.
 *
 * The geometry is built once from `lib/spherical-harmonic` and never rebuilt.
 * The loop stops whenever the canvas leaves the viewport or the tab goes to the
 * background, and under reduced motion it renders one still frame and returns.
 */
export function useHarmonicScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef);
  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      // No WebGL available. The static placeholder behind the canvas stays.
      return;
    }

    renderer.setClearAlpha(0);

    const surface = buildHarmonicSurface(POINT_COUNT);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(surface.positions, 3));
    geometry.setAttribute('intensity', new BufferAttribute(surface.intensities, 1));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uSize: { value: 26 },
        uPixelRatio: { value: 1 },
        uLowColor: { value: readColour(canvas, '--sky-high', '#0284c7') },
        uHighColor: { value: readColour(canvas, '--signal-cyan', '#22d3ee') },
        uOpacity: { value: 0.85 },
      },
    });

    applyBlending(material);

    const points = new Points(geometry, material);
    const scene = new Scene();
    scene.add(points);

    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = surfaceExtent(surface) * CAMERA_FIT;

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

    const applyTheme = () => {
      material.uniforms.uLowColor!.value = readColour(canvas, '--sky-high', '#0284c7');
      material.uniforms.uHighColor!.value = readColour(canvas, '--signal-cyan', '#22d3ee');
      applyBlending(material);
    };

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', applyTheme);

    // Pointer parallax, eased toward its target so it never snaps.
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
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
    }

    let frameHandle = 0;
    let lastTime = 0;

    const renderFrame = (time: number) => {
      const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;

      points.rotation.y += elapsed * ROTATION_PER_SECOND;

      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;
      points.rotation.x = pointer.y * POINTER_TILT;
      points.rotation.z = pointer.x * POINTER_TILT * 0.4;

      renderer.render(scene, camera);
      frameHandle = requestAnimationFrame(renderFrame);
    };

    if (shouldAnimate) {
      frameHandle = requestAnimationFrame(renderFrame);
    } else {
      // One still frame, at a pleasant angle rather than dead-on.
      points.rotation.set(0.2, 0.6, 0);
      renderer.render(scene, camera);
    }

    return () => {
      if (frameHandle) cancelAnimationFrame(frameHandle);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyTheme);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef, shouldAnimate]);

  return { pointCount: POINT_COUNT, reducedMotion };
}
