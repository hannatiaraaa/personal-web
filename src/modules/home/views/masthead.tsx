import { brandSentence, identity, positioning } from '@/content/facts';
import { heroCaption, heroEmergence } from '@/content/hero';
import { FlowFieldMount } from '@/modules/visual/components/flow-field-mount';

export function Masthead() {
  return (
    <section className='relative isolate'>
      <div
        aria-hidden='true'
        className='sky-field'
      />

      <div className='grid gap-10 lg:grid-cols-[1fr_1.618fr] lg:gap-x-14 lg:gap-y-6'>
        <div className='lg:col-start-1 lg:row-start-1 lg:self-end'>
          <p className='legend'>
            {identity.brandLine} · {identity.location} · {identity.timezone}
          </p>

          <h1 className='text-display text-ink mt-5 font-semibold tracking-[-0.04em] text-balance'>{identity.name}</h1>

          <p className='text-lead text-ink mt-6 text-pretty'>{brandSentence}</p>
        </div>

        <div className='lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center'>
          <FlowFieldMount />

          <p className='text-meta text-ink-muted mt-6'>
            {heroCaption} <span className='text-ink-faint'>{heroEmergence}</span>
          </p>
        </div>

        <div className='lg:col-start-1 lg:row-start-2 lg:self-start'>
          <p className='text-body text-ink-muted'>
            I build <span className='text-ink font-medium'>{positioning.domain}</span> for fleet operations —{' '}
            {positioning.surfaces.join(', ')}. Most of my code is the offline app crews use at sea, where there is no
            network to fall back on.
          </p>
        </div>
      </div>
    </section>
  );
}
