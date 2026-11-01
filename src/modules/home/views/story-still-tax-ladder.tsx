import { compareLadders, DEFAULT_LADDER_SETTINGS, formatGapPercent } from '@/modules/visual/lib/tax-ladder';
import { at, StillSvg } from './story-still-frame';

/** The playground's own default gap, so the still can never disagree with the board it opens. */
const TAX_GAP = formatGapPercent(compareLadders(DEFAULT_LADDER_SETTINGS).gapBasisPoints);

const RECEIPT = { x: 12, y: 10, width: 140, height: 130 } as const;
const BAR_X = 24;
const BAR_HEIGHT = 7;
const TAX_PILL = { width: 22, gap: 3 } as const;

/**
 * Each level's amount already carries the tax of the level below, so the bar
 * a level taxes is the last bar plus its tax. Drawn, not computed: the shape
 * is the point, and the one number on the still comes from the playground.
 */
const LEVELS = [
  { label: 'ITEM LINE', y: 32, bar: 46 },
  { label: 'SERVICE SCOPE', y: 62, bar: 71 },
  { label: 'DOCUMENT', y: 92, bar: 96 },
] as const;

const TOTAL_Y = 124;
const TOTAL_WIDTH = 121;

export function TaxLadderStill() {
  return (
    <StillSvg>
      <rect
        x={RECEIPT.x}
        y={RECEIPT.y}
        width={RECEIPT.width}
        height={RECEIPT.height}
        rx='4'
        className='fill-surface stroke-line-strong'
        strokeWidth='1.25'
      />
      {LEVELS.map((level, index) => (
        <g key={level.label}>
          <text
            x={BAR_X}
            y={level.y - 5}
            fontSize='6'
            letterSpacing='0.6'
            className='fill-ink-faint font-mono'
          >
            {level.label}
          </text>
          <rect
            x={BAR_X}
            y={level.y}
            width={level.bar}
            height={BAR_HEIGHT}
            rx={BAR_HEIGHT / 2}
            className='fill-line-strong work-still-grow-x'
            style={at(index * 2)}
          />
          <g
            className='work-still-pop'
            style={at(index * 2 + 1)}
          >
            <rect
              x={BAR_X + level.bar + TAX_PILL.gap}
              y={level.y - 1.5}
              width={TAX_PILL.width}
              height={BAR_HEIGHT + 3}
              rx={(BAR_HEIGHT + 3) / 2}
              className='fill-signal'
            />
            <text
              x={BAR_X + level.bar + TAX_PILL.gap + TAX_PILL.width / 2}
              y={level.y + 5.5}
              textAnchor='middle'
              fontSize='6'
              fontWeight='700'
              className='fill-surface font-mono'
            >
              +tax
            </text>
          </g>
        </g>
      ))}

      <line
        x1={BAR_X}
        y1={TOTAL_Y - 16}
        x2={RECEIPT.x + RECEIPT.width - 12}
        y2={TOTAL_Y - 16}
        className='stroke-line-strong'
        strokeWidth='1'
        strokeDasharray='2 2'
      />
      <text
        x={BAR_X}
        y={TOTAL_Y - 5}
        fontSize='6'
        letterSpacing='0.6'
        className='fill-ink-faint font-mono'
      >
        TOTAL
      </text>
      <rect
        x={BAR_X}
        y={TOTAL_Y}
        width={TOTAL_WIDTH}
        height={BAR_HEIGHT}
        rx={BAR_HEIGHT / 2}
        className='fill-ink work-still-grow-x'
        style={at(6)}
      />

      <g
        className='work-still-pop'
        style={at(7)}
      >
        <text
          x='196'
          y='72'
          textAnchor='middle'
          fontSize='24'
          fontWeight='700'
          className='fill-signal tnum'
        >
          {TAX_GAP}
        </text>
        <text
          x='196'
          y='86'
          textAnchor='middle'
          fontSize='6.5'
          letterSpacing='0.8'
          className='fill-ink-muted font-mono'
        >
          OVER ONE LADDER
        </text>
      </g>
      <text
        x='196'
        y='136'
        textAnchor='middle'
        fontSize='6'
        letterSpacing='0.8'
        className='fill-ink-faint font-mono'
      >
        ILLUSTRATIVE
      </text>
    </StillSvg>
  );
}
