'use client';

// Client because the WebGL bundle must not be requested on the server.

import dynamic from 'next/dynamic';

/**
 * Static stand-in at exactly the canvas height, so the hero never shifts when
 * the real thing arrives and there is something to look at immediately.
 */
function Placeholder() {
  return (
    <div className='flex flex-col gap-6'>
      <div
        aria-hidden='true'
        className='from-sky-low/30 via-signal-cyan/12 h-[17rem] w-full animate-pulse rounded-[var(--radius)] bg-radial to-transparent sm:h-[23rem]'
      />
      <div className='h-[7.5rem]' />
    </div>
  );
}

const LifePathField = dynamic(() => import('./life-path-field').then((module) => module.LifePathField), {
  ssr: false,
  loading: () => <Placeholder />,
});

/**
 * The hero visual is above the fold, so it is not viewport-gated — but it is
 * still a deferred chunk. The masthead text is server-rendered and paints
 * first; the field arrives a beat later and the home route's First Load JS
 * never carries three.js.
 */
export function LifePathFieldMount() {
  return <LifePathField />;
}
