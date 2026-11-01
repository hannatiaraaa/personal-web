import type { DraftSyncStep } from '@/modules/visual/lib/draft-sync';
import { DRAFT_SYNC_SERVER } from '@/modules/visual/lib/draft-sync-drawing';

/** The server's copy of the work order: its version, its value, and whether it is done or reverted. */
export function DraftSyncServer({ step }: { step: DraftSyncStep }) {
  const state = step.outcome === 'reverted' ? 'reverted' : step.record.isCompleted ? 'completed' : 'open';
  return (
    <g
      className='draft-sync-server'
      data-state={state}
    >
      <rect
        x={DRAFT_SYNC_SERVER.x}
        y={DRAFT_SYNC_SERVER.y}
        width={DRAFT_SYNC_SERVER.w}
        height={DRAFT_SYNC_SERVER.h}
        rx='14'
        className='draft-sync-server-card'
      />
      <rect
        x={DRAFT_SYNC_SERVER.x}
        y={DRAFT_SYNC_SERVER.y}
        width={DRAFT_SYNC_SERVER.w}
        height={DRAFT_SYNC_SERVER.h}
        rx='14'
        className='draft-sync-server-flash'
      />
      <text
        x={DRAFT_SYNC_SERVER.x + 16}
        y={DRAFT_SYNC_SERVER.y + 24}
        fontSize='11'
        className='draft-sync-kicker font-mono'
      >
        SERVER · WORK ORDER
      </text>
      <text
        x={DRAFT_SYNC_SERVER.x + 16}
        y={DRAFT_SYNC_SERVER.y + 66}
        fontSize='34'
        fontWeight='700'
        className='draft-sync-version tnum'
      >
        v{step.record.version}
      </text>
      <text
        x={DRAFT_SYNC_SERVER.x + 16}
        y={DRAFT_SYNC_SERVER.y + 96}
        fontSize='16'
        fontWeight='600'
        fill='var(--ink)'
      >
        {step.record.value}
      </text>
      <g
        className='draft-sync-badge'
        transform={`translate(${DRAFT_SYNC_SERVER.x + DRAFT_SYNC_SERVER.w - 34}, ${DRAFT_SYNC_SERVER.y + 48})`}
      >
        <circle r='15' />
        {state === 'completed' && <path d='M-6 0l4 4 8-8' />}
        {state === 'reverted' && <path d='M5 -3a6 6 0 1 0 1 5M5 -8v5h-5' />}
      </g>
    </g>
  );
}
