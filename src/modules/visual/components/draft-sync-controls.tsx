import { SYNC_POLICIES, type SyncPolicy } from '@/modules/visual/lib/draft-sync';
import { SegmentedToggle } from './segmented-toggle';

const POLICY_LABEL: Record<SyncPolicy, string> = {
  'last-write-wins': 'Without ownership',
  'draft-ownership': 'With draft ownership',
};

type Props = {
  policy: SyncPolicy;
  /** Absent in the static stand-in, which renders the same controls disabled. */
  onSelect?: (policy: SyncPolicy) => void;
  onReplay?: () => void;
  onSkip?: () => void;
  /** Whether a run is playing, so there is something to skip. */
  isRunning?: boolean;
};

/** Which policy the run is played under — each press replays it — a replay, and a skip to the end. */
export function DraftSyncControls({ policy, onSelect, onReplay, onSkip, isRunning = false }: Props) {
  return (
    <div className='draft-sync-controls'>
      <SegmentedToggle
        label='Sync policy'
        options={SYNC_POLICIES}
        labels={POLICY_LABEL}
        selected={policy}
        onSelect={onSelect}
        className='draft-sync-toggle'
      />
      <button
        type='button'
        disabled={!onReplay}
        onClick={onReplay}
        className='draft-sync-replay press'
      >
        <svg
          aria-hidden='true'
          viewBox='0 0 16 16'
          width='14'
          height='14'
          fill='none'
        >
          <path
            d='M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3'
            stroke='currentColor'
            strokeWidth='1.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        Replay
      </button>
      {/* Idle, the skip is `aria-disabled` rather than `disabled`: a run ending
          under a focused Skip would otherwise drop keyboard focus to the page. */}
      <button
        type='button'
        disabled={!onSkip}
        aria-disabled={onSkip && !isRunning ? true : undefined}
        onClick={isRunning ? onSkip : undefined}
        className='draft-sync-replay draft-sync-skip press'
      >
        Skip
      </button>
    </div>
  );
}
