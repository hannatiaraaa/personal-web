import { buildDotGrid } from '@/modules/home/lib/story-dot-grid';
import { at, StillSvg } from './story-still-frame';

/** The release run: every case a dot, one inherited gap among the passes. */
const GATE_DOTS = buildDotGrid({ columns: 17, rows: 9, pitch: 11, centerX: 120, centerY: 62, flaggedIndex: 77 });
const DOT_RADIUS = 3;
const FLAGGED_RADIUS = 4.2;
const FLAGGED_RING_RADIUS = 8;
/** Lands after the last dot of the sweep. */
const RING_ORDER = GATE_DOTS.length + 4;

const LEGEND_Y = 134;

export function GateStill() {
  const flagged = GATE_DOTS.find((dot) => dot.isFlagged);

  return (
    <StillSvg>
      {GATE_DOTS.map((dot, index) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={dot.isFlagged ? FLAGGED_RADIUS : DOT_RADIUS}
          className={dot.isFlagged ? 'fill-caution work-still-dot' : 'fill-signal-bright work-still-dot'}
          style={at(index)}
        />
      ))}
      {flagged && (
        <circle
          cx={flagged.x}
          cy={flagged.y}
          r={FLAGGED_RING_RADIUS}
          fill='none'
          strokeWidth='1.75'
          className='stroke-caution work-still-ring'
          style={at(RING_ORDER)}
        />
      )}

      <circle
        cx='44'
        cy={LEGEND_Y - 2}
        r={DOT_RADIUS}
        className='fill-signal-bright'
      />
      <text
        x='51'
        y={LEGEND_Y}
        fontSize='6.5'
        letterSpacing='0.6'
        className='fill-ink-muted font-mono'
      >
        PASS
      </text>
      <circle
        cx='86'
        cy={LEGEND_Y - 2}
        r={FLAGGED_RADIUS}
        className='fill-caution'
      />
      <text
        x='94'
        y={LEGEND_Y}
        fontSize='6.5'
        letterSpacing='0.6'
        className='fill-caution font-mono'
      >
        INHERITED · QUARANTINED BY NAME
      </text>
    </StillSvg>
  );
}
