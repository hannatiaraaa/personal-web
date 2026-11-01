import type { CaseStudy } from '@/content/case-studies';
import { workStory } from '@/content/work-story';
import { ScrollyStage } from '@/common/components/scrolly-stage';
import { formatPosition } from '@/common/lib/format-position';
import { StoryStill } from './story-still';
import { WorkStoryStep } from './work-story-step';

type Props = {
  studies: readonly CaseStudy[];
};

/**
 * The pinned panel: every study's drawing stacked in one cell, the active
 * step's showing, keyed off `data-active-step` in scrolly-home.css. Hidden from
 * assistive tech because it repeats the steps, which are the content.
 */
function StoryPanel({ studies }: Props) {
  // The last step's number is the count.
  const count = formatPosition(studies.length - 1);

  return (
    <div
      aria-hidden='true'
      className='work-story-panel card'
    >
      <div className='work-story-frames'>
        {studies.map((study, index) => (
          <div
            key={study.slug}
            data-frame={index}
            className='work-story-frame work-still'
          >
            <p className='legend'>{workStory.reportedLabel}</p>
            <p className='text-h2 text-ink mt-2 font-semibold tracking-[-0.03em] text-balance'>
              &ldquo;{study.reported}&rdquo;
            </p>
            <div className='work-story-frame-art'>
              <StoryStill study={study} />
            </div>
            <p className='text-micro text-ink-faint mt-3 flex justify-between gap-4 font-mono uppercase'>
              <span className='min-w-0 truncate'>{study.context}</span>
              <span className='tnum shrink-0'>
                {formatPosition(index)} / {count}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className='mt-4 flex gap-2'>
        {studies.map((study) => (
          <span
            key={study.slug}
            className='work-story-tick bg-line h-0.5 flex-1 overflow-hidden rounded-full'
          >
            <span className='work-story-tick-fill bg-signal block h-full w-full' />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The case studies as one scroll story. Where the screen is wide and tall
 * enough, each drawing holds in a pinned panel while its step scrolls past;
 * elsewhere, and under reduced motion or without scripts, each step is a card
 * with its own drawing. One list of steps either way, so each study links once.
 */
export function WorkStory({ studies }: Props) {
  return (
    <ScrollyStage
      label={workStory.stageLabel}
      className='work-story-stage'
      visual={<StoryPanel studies={studies} />}
      steps={studies.map((study, index) => (
        <WorkStoryStep
          key={study.slug}
          study={study}
          index={index}
        />
      ))}
    />
  );
}
