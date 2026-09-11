import Link from 'next/link';
import type { CaseStudy } from '@/content/case-studies';
import { ArrowIcon } from './icons';

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
      className="card card-interactive reveal group flex flex-col p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="tnum font-mono text-micro text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="font-mono text-micro text-ink-faint uppercase">{study.period}</span>
      </div>

      <p className="mt-4 font-mono text-meta text-ink-faint">
        Reported<span className="text-signal">:</span>{' '}
        <span className="text-ink-muted">&ldquo;{study.reported}&rdquo;</span>
      </p>

      <h3 className="mt-2.5 text-h3 font-semibold tracking-[-0.015em] text-ink">{study.title}</h3>

      <p className="mt-2.5 flex-1 text-meta text-ink-muted">{study.summary}</p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="font-mono text-micro text-ink-faint">{study.stack.slice(0, 3).join(' · ')}</span>
        <span className="flex items-center gap-1.5 text-meta font-medium text-signal">
          Read
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
