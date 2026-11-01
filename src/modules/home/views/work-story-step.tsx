import Link from 'next/link';
import type { CaseStudy } from '@/content/case-studies';
import { tryIt } from '@/content/try-it';
import { workStory } from '@/content/work-story';
import { ArrowIcon } from '@/common/components/icons';
import { formatPosition } from '@/common/lib/format-position';
import { storyAction } from '@/modules/home/lib/work-story';
import { StoryStill } from './story-still';

type Props = {
  study: CaseStudy;
  index: number;
};

/** The step's one link: run the piece where there is one, read the study where there is not. */
function StoryCta({ study, titleId }: { study: CaseStudy; titleId: string }) {
  const action = storyAction(study);
  const arrow = <ArrowIcon className='transition-transform duration-200 group-hover:translate-x-1' />;

  if (action.kind === 'try') {
    return (
      <Link
        href={action.href}
        aria-describedby={titleId}
        className='btn-primary group mt-6 self-start'
      >
        {tryIt.prefix} — {tryIt.action[action.interactive]}
        {arrow}
      </Link>
    );
  }

  return (
    <Link
      href={action.href}
      aria-describedby={titleId}
      className='btn-quiet group mt-6 self-start'
    >
      {tryIt.read}
      {arrow}
    </Link>
  );
}

/**
 * One case study as a step of the story: what was reported, what it turned out
 * to be, and one way in. Where the story pins, the drawing is in the panel
 * beside the steps; everywhere else each step is a card carrying its own.
 */
export function WorkStoryStep({ study, index }: Props) {
  const titleId = `work-story-${study.slug}`;

  return (
    <article
      aria-labelledby={titleId}
      className='work-story-card'
    >
      <span
        aria-hidden='true'
        className='work-story-rule bg-signal'
      />
      <div className='work-story-card-art work-still'>
        <StoryStill study={study} />
      </div>

      <div className='work-story-card-text flex flex-col'>
        <p className='text-micro text-ink-faint flex gap-3 font-mono uppercase'>
          <span className='tnum'>{formatPosition(index)}</span>
          <span>{study.period}</span>
        </p>
        <p className='text-meta text-ink-faint mt-4 font-mono'>
          {workStory.reportedLabel}
          <span className='text-signal'>:</span> <span className='text-ink-muted'>&ldquo;{study.reported}&rdquo;</span>
        </p>
        <p className='legend text-signal mt-4'>{workStory.actualLabel}</p>
        <h3
          id={titleId}
          className='text-h2 text-ink mt-2 font-semibold tracking-[-0.025em] text-balance'
        >
          {study.title}
        </h3>
        <p className='text-body text-ink-muted mt-4 text-pretty'>{study.summary}</p>
        <StoryCta
          study={study}
          titleId={titleId}
        />
      </div>
    </article>
  );
}
