import Link from 'next/link';
import type { CaseStudy } from '@/content/case-studies';
import { ArrowIcon } from '@/common/components/icons';

export function NextCaseStudy({ study }: { study: CaseStudy }) {
  return (
    <nav aria-label='Next case study'>
      <Link
        href={`/work/${study.slug}`}
        className='card card-interactive group block p-5 sm:p-6'
      >
        <p className='legend'>Next</p>
        <p className='text-h3 text-ink mt-2.5 flex items-baseline justify-between gap-4 font-semibold tracking-[-0.015em]'>
          <span>{study.title}</span>
          <ArrowIcon className='text-signal shrink-0 transition-transform duration-300 group-hover:translate-x-1' />
        </p>
      </Link>
    </nav>
  );
}
