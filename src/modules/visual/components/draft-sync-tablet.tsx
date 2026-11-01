import type { DraftSyncStep, TabletId, TabletState } from '@/modules/visual/lib/draft-sync';
import { DRAFT_SYNC_TABLETS } from '@/modules/visual/lib/draft-sync-drawing';

/** Each signal bar's height, shortest first; they share a baseline. */
const SIGNAL_BARS = [
  { dx: 0, h: 4 },
  { dx: 6, h: 7 },
  { dx: 12, h: 10 },
  { dx: 18, h: 13 },
] as const;

const SIGNAL_STATUS: Record<TabletState['signal'], string> = {
  online: 'online',
  offline: 'no signal',
  reconnecting: 'reconnecting',
};

/**
 * Each bar is an outline with a fill laid over it. The fill shows when the
 * tablet has signal and comes back bar by bar as it reconnects — an opacity
 * change, so the reconnect animates on the compositor, not by repainting.
 */
function SignalBars({ x, y, signal }: { x: number; y: number; signal: TabletState['signal'] }) {
  return (
    <g
      className='draft-sync-signal'
      data-signal={signal}
    >
      {SIGNAL_BARS.map((bar) => (
        <g
          key={bar.dx}
          className='draft-sync-signal-bar'
        >
          <rect
            x={x + bar.dx}
            y={y - bar.h}
            width='4'
            height={bar.h}
            rx='1'
            className='draft-sync-signal-frame'
          />
          <rect
            x={x + bar.dx}
            y={y - bar.h}
            width='4'
            height={bar.h}
            rx='1'
            className='draft-sync-signal-fill'
          />
        </g>
      ))}
    </g>
  );
}

/** A tablet: its name, signal, and what is on its screen — its own draft, or the synced record. */
export function DraftSyncTablet({ id, state, step }: { id: TabletId; state: TabletState; step: DraftSyncStep }) {
  const box = DRAFT_SYNC_TABLETS[id];
  const screen = state.draft
    ? { kicker: 'Draft', value: state.draft.value, meta: `base v${state.draft.baseVersion}` }
    : { kicker: 'Synced', value: step.record.value, meta: `v${step.record.version}` };

  return (
    <g
      className='draft-sync-tablet'
      data-signal={state.signal}
    >
      <text
        x={box.x}
        y={box.y - 28}
        fontSize='14'
        fontWeight='600'
        fill='var(--ink)'
      >
        Tablet {id}
      </text>
      <text
        x={box.x}
        y={box.y - 10}
        fontSize='12'
        className='draft-sync-status font-mono'
      >
        {SIGNAL_STATUS[state.signal]}
      </text>
      <SignalBars
        x={box.x + box.w - 22}
        y={box.y - 12}
        signal={state.signal}
      />
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx='14'
        className='draft-sync-tablet-body'
      />
      <rect
        x={box.x + 8}
        y={box.y + 8}
        width={box.w - 16}
        height={box.h - 22}
        rx='7'
        className='draft-sync-tablet-screen'
        data-has-draft={state.draft ? 'true' : undefined}
      />
      <circle
        cx={box.x + box.w / 2}
        cy={box.y + box.h - 7}
        r='2.5'
        fill='var(--line-strong)'
      />
      <text
        x={box.x + 18}
        y={box.y + 30}
        fontSize='11'
        className='draft-sync-kicker font-mono'
      >
        {screen.kicker.toUpperCase()}
      </text>
      <text
        x={box.x + 18}
        y={box.y + 56}
        fontSize='16'
        fontWeight='600'
        fill='var(--ink)'
      >
        {screen.value}
      </text>
      <text
        x={box.x + 18}
        y={box.y + 78}
        fontSize='12'
        fill='var(--ink-muted)'
        className='font-mono'
      >
        {screen.meta}
      </text>
    </g>
  );
}
