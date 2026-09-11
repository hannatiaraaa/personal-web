'use client';

// Client because it owns a WebGL context and a frame loop.

import { useRef } from 'react';
import { heroFormulas } from '@/content/hero';
import { useFlowFieldScene } from '@/modules/visual/hooks/use-flow-field-scene';

/**
 * The hero: a pool of points placed by the golden angle, moving as ocean swell,
 * with the front of a harvested Fisher–Kolmogorov invasion sweeping through it.
 * Touching the pool drops a ripple.
 */
export function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pointCount, reducedMotion } = useFlowFieldScene(canvasRef);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className='block h-[19rem] w-full cursor-crosshair touch-none sm:h-[26rem]'
        role='img'
        aria-label={`A pool of ${pointCount.toLocaleString('en')} points placed by the golden angle, undulating as ocean swell while a reaction–diffusion front sweeps through. Click or touch to drop a ripple.`}
      />
      {/* In flow rather than floating: in a narrow column the line wraps, and
          an absolutely positioned one ran into the caption beneath it. */}
      <p className='text-micro text-ink-faint mt-3 font-mono leading-relaxed'>
        {heroFormulas}
        {reducedMotion && ' · still — touch to ripple'}
      </p>
    </div>
  );
}
