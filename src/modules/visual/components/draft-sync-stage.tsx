import { draftSyncCopy } from '@/content/interactives';
import { DRAFT_SYNC_STEP_COUNT, type DraftSyncStep, type SyncPolicy } from '@/modules/visual/lib/draft-sync';
import {
  DRAFT_SYNC_LINKS,
  DRAFT_SYNC_TIMELINE_Y,
  DRAFT_SYNC_VIEW,
  timelineDotX,
} from '@/modules/visual/lib/draft-sync-drawing';
import { stepState } from '@/modules/visual/lib/step-state';
import { DraftSyncPacket } from './draft-sync-packet';
import { DraftSyncServer } from './draft-sync-server';
import { DraftSyncStamp } from './draft-sync-stamp';
import { DraftSyncTablet } from './draft-sync-tablet';

/** One simulator per page, and its stand-in is replaced rather than kept beside it. */
const SEA_CLIP_ID = 'draft-sync-sea-clip';
/** The waves are drawn wider than the drawing, so their drift never shows an end. */
const WAVE_BACK = `M-80 354 q20 -9 40 0 ${'t40 0 '.repeat(16)} V${DRAFT_SYNC_VIEW.height} H-80 Z`;
const WAVE_FRONT = `M-100 366 q20 -7 40 0 ${'t40 0 '.repeat(17)} V${DRAFT_SYNC_VIEW.height} H-100 Z`;
const TABLET_IDS = ['A', 'B'] as const;

type Props = { step: DraftSyncStep; beat: number; policy: SyncPolicy; run: string };

/**
 * The simulator's drawing: a server record, two tablets at sea, and the
 * messages between them for the step on screen. Messages are keyed by `run`,
 * so a step replayed draws its messages again rather than leaving them
 * finished.
 */
export function DraftSyncStage({ step, beat, policy, run }: Props) {
  const rejected = step.messages.find((message) => message.delivery === 'rejected');

  return (
    <svg
      viewBox={`0 0 ${DRAFT_SYNC_VIEW.width} ${DRAFT_SYNC_VIEW.height}`}
      role='img'
      aria-label={draftSyncCopy.description[policy]}
      className='draft-sync-svg'
      fill='none'
    >
      {/* The waves drift sideways past the drawing's edge; where the frame is
          wider than the drawing, that edge would otherwise show. */}
      <clipPath id={SEA_CLIP_ID}>
        <rect
          width={DRAFT_SYNC_VIEW.width}
          height={DRAFT_SYNC_VIEW.height}
          rx='14'
        />
      </clipPath>
      <g
        className='draft-sync-sea'
        clipPath={`url(#${SEA_CLIP_ID})`}
      >
        <path
          d={WAVE_BACK}
          className='draft-sync-wave-back'
        />
      </g>

      {TABLET_IDS.map((id) => (
        <g key={id}>
          <line
            x1={DRAFT_SYNC_LINKS[id].tablet.x}
            y1={DRAFT_SYNC_LINKS[id].tablet.y}
            x2={DRAFT_SYNC_LINKS[id].server.x}
            y2={DRAFT_SYNC_LINKS[id].server.y}
            className='draft-sync-link'
            data-signal={step.tablets[id].signal}
          />
          {step.tablets[id].signal === 'offline' && (
            <path
              d={`M${DRAFT_SYNC_LINKS[id].cut.x - 6} ${DRAFT_SYNC_LINKS[id].cut.y - 6}l12 12M${DRAFT_SYNC_LINKS[id].cut.x + 6} ${DRAFT_SYNC_LINKS[id].cut.y - 6}l-12 12`}
              className='draft-sync-cut'
            />
          )}
        </g>
      ))}

      <g key={`server-${run}`}>
        <DraftSyncServer step={step} />
      </g>

      {rejected && rejected.from !== 'server' && (
        <path
          key={`guard-${run}`}
          d={`M${DRAFT_SYNC_LINKS[rejected.from].guard.x - 14} ${DRAFT_SYNC_LINKS[rejected.from].guard.y - 12}l28 24`}
          className='draft-sync-guard'
        />
      )}

      {TABLET_IDS.map((id) => (
        <DraftSyncTablet
          key={id}
          id={id}
          state={step.tablets[id]}
          step={step}
        />
      ))}

      <g
        className='draft-sync-sea'
        clipPath={`url(#${SEA_CLIP_ID})`}
      >
        <path
          d={WAVE_FRONT}
          className='draft-sync-wave-front'
        />
      </g>

      <g className='draft-sync-timeline'>
        {Array.from({ length: DRAFT_SYNC_STEP_COUNT }, (_, index) => (
          <circle
            key={index}
            cx={timelineDotX(index)}
            cy={DRAFT_SYNC_TIMELINE_Y}
            r='4'
            data-state={stepState(index, beat)}
          />
        ))}
      </g>

      <g key={`stamp-${run}`}>
        <DraftSyncStamp step={step} />
      </g>

      <g key={`packets-${run}`}>
        {step.messages.map((message) => (
          <DraftSyncPacket
            key={`${message.from}-${message.to}`}
            message={message}
          />
        ))}
      </g>
    </svg>
  );
}
