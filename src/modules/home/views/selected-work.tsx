import Link from 'next/link';
import { caseStudies } from '@/content/case-studies';
import { workStory } from '@/content/work-story';
import { ArrowIcon } from '@/common/components/icons';
import { pickStoryStudies } from '@/modules/home/lib/work-story';
import { WorkStory } from './work-story';

/**
 * Selected work, told as one story: the studies whose mechanism can be drawn
 * in one frame, each with its report, what it turned out to be, and one way
 * in — running the piece where there is one. The rest are a link away.
 */
export function SelectedWork() {
  const studies = pickStoryStudies(caseStudies);
  if (studies.length === 0) return null;

  return (
    <section aria-labelledby='problems'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='legend'>{workStory.legend}</p>
          <h2
            id='problems'
            className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
          >
            {workStory.title}
          </h2>
        </div>
        <Link
          href='/work'
          className='text-micro text-ink-muted hover:text-signal group flex items-center gap-1.5 font-mono uppercase transition-colors pointer-coarse:min-h-11'
        >
          All {caseStudies.length}
          <ArrowIcon className='transition-transform duration-200 group-hover:translate-x-1' />
        </Link>
      </div>
      <p className='text-body text-ink-muted mt-3 max-w-2xl'>{workStory.lead}</p>

      <div className='mt-8'>
        <WorkStory studies={studies} />
      </div>
    </section>
  );
}
