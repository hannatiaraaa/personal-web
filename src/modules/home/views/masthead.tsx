import { brandSentence, identity, positioning } from '@/content/facts';
import { heroCaption, heroEmergence } from '@/content/hero';
import { FlowFieldMount } from '@/modules/visual/components/flow-field-mount';

/**
 * Name and pool, side by side.
 *
 * The pool comes first in the source, so on a narrow screen it is what a
 * visitor meets before any prose. On a wide one the two sit level: the piece is
 * the claim, and the name is who is making it.
 *
 * Text never sits over the canvas — contrast against a moving field is not
 * something a gate can check.
 */
export function Masthead() {
  return (
    <section className='relative isolate'>
      <div
        aria-hidden='true'
        className='sky-field'
      />

      <div className='grid items-center gap-10 lg:grid-cols-[0.75fr_1fr] lg:gap-14'>
        <div className='order-2 lg:order-1'>
          <p className='legend'>
            {identity.brandLine} · {identity.location} · {identity.timezone}
          </p>

          <h1 className='text-display text-ink mt-5 font-semibold tracking-[-0.04em] text-balance'>{identity.name}</h1>

          <p className='text-lead text-ink mt-6 text-pretty'>{brandSentence}</p>

          <p className='text-body text-ink-muted mt-5'>
            I build <span className='text-ink font-medium'>{positioning.domain}</span> for fleet operations —{' '}
            {positioning.surfaces.join(', ')}. Most of my code is the offline app crews use at sea, where there is no
            network to fall back on.
          </p>
        </div>

        <div className='order-1 lg:order-2'>
          <FlowFieldMount />

          <p className='text-meta text-ink-muted mt-6'>
            {heroCaption} <span className='text-ink-faint'>{heroEmergence}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
