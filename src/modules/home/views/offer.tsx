import Link from 'next/link';
import { headlineFigures, identity, positioning } from '@/content/facts';
import { FigureRow } from '@/common/components/figure-row';
import { ArrowIcon } from '@/common/components/icons';

/** The evidence and the two ways to act on it, directly under the hero. */
export function Offer() {
  return (
    <section aria-label='Evidence and contact'>
      <FigureRow figures={headlineFigures} />

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
