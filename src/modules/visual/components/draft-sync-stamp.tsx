import type { DraftSyncStep } from '@/modules/visual/lib/draft-sync';
import { DRAFT_SYNC_STAMP } from '@/modules/visual/lib/draft-sync-drawing';

/** The outcome, stamped across the drawing once the stale draft arrives. */
export function DraftSyncStamp({ step }: { step: DraftSyncStep }) {
  if (step.outcome === 'pending') return null;
  const isReverted = step.outcome === 'reverted';
  return (
    <g
      className='draft-sync-stamp'
      data-outcome={step.outcome}
    >
      <rect
        x={DRAFT_SYNC_STAMP.x}
        y={DRAFT_SYNC_STAMP.y}
        width={DRAFT_SYNC_STAMP.w}
        height={DRAFT_SYNC_STAMP.h}
        rx='10'
      />
      <text
        x={DRAFT_SYNC_STAMP.x + DRAFT_SYNC_STAMP.w / 2}
        y={DRAFT_SYNC_STAMP.y + 27}
        textAnchor='middle'
        fontSize='18'
        fontWeight='700'
        className='font-mono'
      >
        {isReverted ? 'REVERTED' : 'REJECTED'}
      </text>
      <text
        x={DRAFT_SYNC_STAMP.x + DRAFT_SYNC_STAMP.w / 2}
        y={DRAFT_SYNC_STAMP.y + 47}
        textAnchor='middle'
        fontSize='12'
        className='font-mono'
      >
        {isReverted ? `v${step.record.version} · job reopened` : 'job already completed'}
      </text>
    </g>
  );
}
