import Link from 'next/link';
import { education } from '@/content/facts';
import { ArrowIcon } from '@/common/components/icons';

/** The mathematics is part of how I work, so it gets a door rather than a mention. */
export function Mathematics() {
  return (
    <section
      aria-labelledby='maths'
      className='card reveal from-signal-wash to-surface overflow-hidden bg-linear-to-br p-6 sm:p-8'
    >
      <p className='legend'>Before software</p>
      <h2
        id='maths'
        className='text-h2 text-ink mt-3 max-w-2xl font-semibold tracking-[-0.025em]'
      >
        Applied mathematics, and the habit it left behind
      </h2>
      <p className='text-body text-ink-muted mt-4 max-w-2xl'>
        {education.degree}, {education.institution}. One of my two published papers is an agent-based contagion model.
        It runs live on the about page, because a model you can move is a better argument than a citation.
      </p>
      <Link
        href='/about'
        className='btn-quiet group mt-6'
      >
        Run the model
        <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
      </Link>
    </section>
  );
}
