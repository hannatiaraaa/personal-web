import Link from 'next/link';
import { brandSentence, headlineFigures, identity, positioning } from '@/content/facts';
import { heroCaption, heroEmergence } from '@/content/hero';
import { FigureRow } from '@/common/components/figure-row';
import { ArrowIcon } from '@/common/components/icons';
import { FlowFieldMount } from '@/modules/visual/components/flow-field-mount';

/**
 * The visualisation comes first, because it is the one thing here nobody else
 * has: one pool of points carrying the golden angle, the thesis equation and
 * the sea in a single moving surface.
 *
 * The name and the claim sit below it on solid ground rather than over the
 * canvas — text over a moving field is a contrast problem you cannot test.
 */
export function Masthead() {
  return (
    <section className='relative isolate'>
      <div
        aria-hidden='true'
        className='sky-field'
      />

      <p className='legend'>
        {identity.brandLine} · {identity.location} · {identity.timezone}
      </p>

      <div className='mt-6'>
        <FlowFieldMount />
      </div>

      <p className='text-meta text-ink-muted mt-8 max-w-2xl'>
        {heroCaption} <span className='text-ink-faint'>{heroEmergence}</span>
      </p>

      <hr className='rule-fade my-10' />

      <h1 className='text-display text-ink font-semibold tracking-[-0.04em] text-balance'>{identity.name}</h1>

      <p className='text-lead text-ink mt-6 max-w-3xl text-pretty'>{brandSentence}</p>

      <p className='text-body text-ink-muted mt-5 max-w-2xl'>
        I build <span className='text-ink font-medium'>{positioning.domain}</span> for fleet operations —{' '}
        {positioning.surfaces.join(', ')}. Most of my code is the offline app crews use at sea, where there is no
        network to fall back on.
      </p>

      <div className='mt-10'>
        <FigureRow figures={headlineFigures} />
      </div>

      <div className='mt-8 flex flex-wrap items-center gap-x-5 gap-y-4'>
        <Link
          href='/work'
          className='btn-primary group'
        >
          Read the case studies
          <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
        </Link>
        <a
          href={`mailto:${identity.email}`}
          className='btn-quiet'
        >
          {identity.email}
        </a>
      </div>

      <p className='text-micro text-ink-faint mt-5 font-mono'>
        {positioning.availability} · {positioning.overlap}
      </p>
    </section>
  );
}
