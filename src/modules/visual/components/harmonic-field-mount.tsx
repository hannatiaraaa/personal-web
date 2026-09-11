'use client';

// Client because the WebGL chunk must not be fetched on the server, and must
// not be fetched at all until the figure is close to the viewport.

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { useInViewport } from '@/common/hooks/use-in-viewport';

const HarmonicField = dynamic(() => import('./harmonic-field').then((module) => module.HarmonicField), {
  ssr: false,
  loading: () => <Placeholder />,
});

/**
 * Static stand-in: a CSS gradient at the same size as the canvas, so nothing
 * shifts when the real thing arrives and something is always on screen.
 */
function Placeholder() {
  return (
    <div
      aria-hidden='true'
      className='from-sky-high/25 via-signal-cyan/10 h-[18rem] w-full animate-pulse rounded-[var(--radius)] bg-radial to-transparent sm:h-[24rem]'
    />
  );
}

/**
 * Defers the whole three.js bundle until the section is nearly in view, so the
 * home route's First Load JS does not move. A visitor who never scrolls this
 * far never downloads it.
 */
export function HarmonicFieldMount() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nearViewport = useInViewport(containerRef, '400px');

  return <div ref={containerRef}>{nearViewport ? <HarmonicField /> : <Placeholder />}</div>;
}
