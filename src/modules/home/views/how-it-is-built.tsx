/**
 * What the hero cost. The interesting part of a visualisation is not that it
 * moves — it is whether it was worth the bytes, so the bytes are written down.
 */
export function HowItIsBuilt() {
  return (
    <section aria-labelledby='built'>
      <p className='legend'>Frontend</p>
      <h2
        id='built'
        className='text-h2 text-ink mt-3 max-w-xl font-semibold tracking-[-0.025em]'
      >
        What the visualisation above costs
      </h2>

      <dl className='mt-8 grid gap-4 sm:grid-cols-3'>
        {[
          {
            term: 'One buffer, one draw call',
            detail:
              'The spiral is computed once and uploaded as a static buffer. Per frame the CPU sends a clock and four ripple records; the swell, the front and every ripple happen in the vertex shader.',
          },
          {
            term: 'The page never carries it',
            detail:
              'The name and the claim are server-rendered and paint first. The 3D bundle is a deferred chunk, so the home route ships the same JavaScript it would without it.',
          },
          {
            term: 'It stops when you look away',
            detail:
              'The loop ends when the canvas leaves the screen or the tab goes to the background, and drops to a smaller pool on a phone. Under reduced motion the water stands still and only a ripple you place redraws it.',
          },
        ].map(({ term, detail }) => (
          <div key={term}>
            <dt className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{term}</dt>
            <dd className='text-meta text-ink-muted mt-2'>{detail}</dd>
          </div>
        ))}
      </dl>

      <p className='text-meta text-ink-muted mt-6 max-w-2xl'>
        The front is the equation from my thesis: <span className='font-mono'>u_t = D∇²u + ru(1 − u) − hu</span>.
        Raising the harvest term <span className='font-mono'>h</span> lowers the level the front settles at, and a large
        enough <span className='font-mono'>h</span> stops it advancing at all — which was the result the thesis was
        written to show.
      </p>
    </section>
  );
}
