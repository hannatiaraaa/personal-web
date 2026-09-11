'use client';

// Client because it owns a WebGL context and a frame loop.

import { useRef } from 'react';
import { useHarmonicScene } from '@/modules/visual/hooks/use-harmonic-scene';
import { DEFAULT_COEFFICIENTS } from '@/modules/visual/lib/spherical-harmonic';

/**
 * A spherical harmonic surface as a point cloud. The shape is entirely
 * determined by the eight integers printed beneath it — which is the reason
 * this is a maths object rather than a particle effect.
 */
export function HarmonicField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pointCount, reducedMotion } = useHarmonicScene(canvasRef);

  const { m, n } = DEFAULT_COEFFICIENTS;

  return (
    <div className='relative'>
      <canvas
        ref={canvasRef}
        className='block h-[18rem] w-full sm:h-[24rem]'
        role='img'
        aria-label={`A spherical harmonic surface drawn as ${pointCount.toLocaleString('en')} points, coloured from azure to cyan by radius, rotating slowly.`}
      />
      <p className='text-micro text-ink-faint pointer-events-none absolute bottom-0 left-0 font-mono'>
        r(θ,φ) = sin({m[0]}φ)^{n[0]} + cos({m[1]}φ)^{n[1]} + sin({m[2]}θ)^{n[2]} + cos({m[3]}θ)^{n[3]}
        {reducedMotion && ' · still frame'}
      </p>
    </div>
  );
}
