import { HarmonicFieldMount } from '@/modules/visual/components/harmonic-field-mount';

/**
 * A work sample rather than decoration. The interesting part is not that it
 * spins — it is what it costs, which is why the cost is written next to it.
 */
export function Visualisation() {
  return (
    <section aria-labelledby='visualisation'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='legend'>Frontend</p>
          <h2
            id='visualisation'
            className='text-h2 text-ink mt-3 max-w-xl font-semibold tracking-[-0.025em]'
          >
            Drawing a function, sixty times a second
          </h2>
        </div>
      </div>

      <p className='text-body text-ink-muted mt-4 max-w-2xl'>
        A spherical harmonic surface, sampled on a Fibonacci lattice so the points spread evenly instead of bunching at
        the poles. The equation underneath it is the whole shape: change one coefficient and a lobe appears. Move your
        pointer across it.
      </p>

      <div className='card reveal mt-8 overflow-hidden p-4 sm:p-6'>
        <HarmonicFieldMount />
      </div>

      <dl className='mt-6 grid gap-4 sm:grid-cols-3'>
        {[
          {
            term: '18,000 points, one draw call',
            detail:
              'A single buffer and a shader with no lights, no textures and no shadow pass. The geometry is built once and never rebuilt.',
          },
          {
            term: 'Nothing loads until you scroll',
            detail:
              'The 3D bundle is fetched only when this section approaches the viewport, so the page you first landed on never paid for it.',
          },
          {
            term: 'It stops when you look away',
            detail:
              'The loop ends when the canvas leaves the screen or the tab goes to the background, and renders one still frame if you have asked for reduced motion.',
          },
        ].map(({ term, detail }) => (
          <div key={term}>
            <dt className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{term}</dt>
            <dd className='text-meta text-ink-muted mt-2'>{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
