'use client';

// Client because the WebGL bundle must not be requested on the server.

import dynamic from 'next/dynamic';

/**
 * Static stand-in filling the same box as the canvas, so the hero never shifts
 * when the real thing arrives and something is on screen immediately.
 */
function Placeholder() {
  return (
    <div
      aria-hidden='true'
      className='from-sky-low/30 via-signal-cyan/12 h-full w-full bg-radial to-transparent'
    />
  );
}

const FlowField = dynamic(() => import('./flow-field').then((module) => module.FlowField), {
  ssr: false,
  loading: () => <Placeholder />,
});

/**
 * The hero sits above the fold, so it is not viewport-gated — but it is still a
 * deferred chunk: the server-rendered text paints first, the pool arrives a
 * beat later, and the home route's First Load JS never carries three.js.
 */
export function FlowFieldMount() {
  return <FlowField />;
}
