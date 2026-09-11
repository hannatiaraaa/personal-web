import Link from 'next/link';
import { caseStudies } from '@/content/case-studies';
import { CaseStudyCard } from '@/modules/work/components/case-study-card';
import { ArrowIcon } from '@/common/components/icons';

const PREVIEW_COUNT = 4;

/** Four of the six. The reported quote is the hook on each card. */
export function SelectedWork() {
  return (
    <section aria-labelledby='problems'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='legend'>Selected work</p>
          <h2
            id='problems'
            className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
          >
            What the problem turned out to be
          </h2>
        </div>
        <Link
          href='/work'
          className='text-micro text-ink-muted hover:text-signal group flex items-center gap-1.5 font-mono uppercase transition-colors'
        >
          All {caseStudies.length}
          <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
        </Link>
      </div>

      <div className='mt-8 grid gap-4 sm:grid-cols-2'>
        {caseStudies.slice(0, PREVIEW_COUNT).map((study, index) => (
          <CaseStudyCard
            key={study.slug}
            study={study}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
