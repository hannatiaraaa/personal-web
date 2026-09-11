import Link from 'next/link';
import type { CaseStudy } from '@/content/case-studies';
import { ArrowIcon } from '@/common/components/icons';

type Props = {
  study: CaseStudy;
  index: number;
};

/**
 * The reported quote leads, because the gap between what was reported and what
 * it turned out to be is the whole argument. The card is flat at rest and lifts
 * once on hover — transform and opacity only, so the interaction never leaves
 * the compositor.
 */
export function CaseStudyCard({ study, index }: Props) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className='card card-interactive reveal group flex flex-col p-5 sm:p-6'
    >
      <div className='flex items-center gap-3'>
        <span className='tnum text-micro text-ink-faint font-mono'>{String(index + 1).padStart(2, '0')}</span>
        <span
          aria-hidden='true'
          className='bg-line h-px flex-1'
        />
        <span className='text-micro text-ink-faint font-mono uppercase'>{study.period}</span>
      </div>

      <p className='text-meta text-ink-faint mt-4 font-mono'>
        Reported<span className='text-signal'>:</span>{' '}
        <span className='text-ink-muted'>&ldquo;{study.reported}&rdquo;</span>
      </p>

      <h3 className='text-h3 text-ink mt-2.5 font-semibold tracking-[-0.015em]'>{study.title}</h3>

      <p className='text-meta text-ink-muted mt-2.5 flex-1'>{study.summary}</p>

      <div className='mt-5 flex items-center justify-between gap-4'>
        <span className='text-micro text-ink-faint font-mono'>{study.stack.slice(0, 3).join(' · ')}</span>
        <span className='text-meta text-signal flex items-center gap-1.5 font-medium'>
          Read
          <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
        </span>
      </div>
    </Link>
  );
}
