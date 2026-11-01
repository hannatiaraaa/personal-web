import type { ReactNode, Ref } from 'react';
import { illustrativeLabels } from '@/content/interactive-labels';
import { draftSyncCopy } from '@/content/interactives';
import type { DraftSyncStep, SyncPolicy } from '@/modules/visual/lib/draft-sync';
import { DraftSyncLog } from './draft-sync-log';
import { DraftSyncStage } from './draft-sync-stage';

type Props = {
  steps: readonly DraftSyncStep[];
  beat: number;
  policy: SyncPolicy;
  run: string;
  /** The sentence the bug was reported in; the drawing ends on it without ownership. */
  reported: string;
  controls: ReactNode;
  announcement?: string;
  /** `static` for the server-rendered stand-in, `live` once the simulator has loaded. */
  status: 'static' | 'live';
  /** The step the page loaded on, before anything has moved; its outcome is shown without its entrance. */
  isFirstFrame?: boolean;
  frameRef?: Ref<HTMLDivElement>;
  /** The drawing, which starts a run by itself when it comes into view. */
  stageRef?: Ref<HTMLDivElement>;
};

function Outcome({
  step,
  reported,
  beat,
  total,
}: {
  step: DraftSyncStep;
  reported: string;
  beat: number;
  total: number;
}) {
  if (step.outcome === 'pending') {
    return (
      <>
        <p className='legend tnum'>
          Step {beat + 1} of {total}
        </p>
        <p className='draft-sync-caption'>{step.label}</p>
      </>
    );
  }
  const isReverted = step.outcome === 'reverted';
  const copy = draftSyncCopy.outcome;
  return (
    <>
      <p className='legend'>{isReverted ? copy.reverted.legend : copy.rejected.legend}</p>
      <p
        key={step.outcome}
        className='draft-sync-headline'
        data-outcome={step.outcome}
      >
        {isReverted ? `“${reported}”` : copy.rejected.headline}
      </p>
      <p className='draft-sync-note'>{copy[step.outcome].note}</p>
    </>
  );
}

/**
 * The simulator's frame: controls, the drawing, what the step means, and the
 * event log. Rendered by the server as the static stand-in and by the client
 * once loaded, from the same markup, so the swap never moves the page.
 */
export function DraftSyncFigure({
  steps,
  beat,
  policy,
  run,
  reported,
  controls,
  announcement,
  status,
  isFirstFrame = false,
  frameRef,
  stageRef,
}: Props) {
  const step = steps[beat] ?? steps.at(-1);
  if (!step) return null;

  return (
    <div
      ref={frameRef}
      className='draft-sync-frame'
      data-draft-sync={status}
      data-outcome={step.outcome}
      data-first-frame={isFirstFrame || undefined}
    >
      <div className='draft-sync-bar'>
        <p className='legend'>{illustrativeLabels.simulation}</p>
        {controls}
      </div>
      <div
        ref={stageRef}
        className='draft-sync-stage'
      >
        <DraftSyncStage
          step={step}
          beat={beat}
          policy={policy}
          run={run}
        />
      </div>
      <div className='draft-sync-outcome'>
        <Outcome
          step={step}
          reported={reported}
          beat={beat}
          total={steps.length}
        />
      </div>
      <DraftSyncLog
        steps={steps}
        beat={beat}
      />
      <p
        aria-live='polite'
        className='sr-only'
      >
        {announcement}
      </p>
    </div>
  );
}
