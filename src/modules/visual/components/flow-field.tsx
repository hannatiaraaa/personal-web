'use client';

// Client because it owns a WebGL context and a frame loop.

import { useRef } from 'react';
import { useFlowFieldScene } from '@/modules/visual/hooks/use-flow-field-scene';

/**
 * The hero: a pool of points placed by the golden angle, moving as ocean swell,
 * with the front of a harvested Fisher–Kolmogorov invasion sweeping through it.
 * Touching the pool drops a ripple. Fills its parent, which sets the size.
 */
export function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pointCount } = useFlowFieldScene(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className='block h-full w-full cursor-crosshair touch-pan-y'
      role='img'
      aria-label={`A pool of ${pointCount.toLocaleString('en')} points placed by the golden angle, undulating as ocean swell while a reaction–diffusion front sweeps through. Click or touch to drop a ripple.`}
    />
  );
}
