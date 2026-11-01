import { at, StillSvg } from './story-still-frame';

const TABLET = { y: 70, width: 62, height: 72 } as const;
const TABLET_A_X = 12;
const TABLET_B_X = 166;
const RECORD = { x: 82, y: 8, width: 76, height: 42 } as const;
/** The height the two sync lines meet the record at. */
const SYNC_Y = 30;

function Tablet({
  x,
  name,
  state,
  draft,
  isStale,
}: {
  x: number;
  name: string;
  state: string;
  draft: string;
  isStale: boolean;
}) {
  const centre = x + TABLET.width / 2;
  return (
    <g>
      <rect
        x={x}
        y={TABLET.y}
        width={TABLET.width}
        height={TABLET.height}
        rx='7'
        className='fill-surface stroke-ink-faint'
        strokeWidth='1.5'
      />
      <rect
        x={x + 5}
        y={TABLET.y + 5}
        width={TABLET.width - 10}
        height={TABLET.height - 14}
        rx='3'
        className={isStale ? 'fill-caution-wash stroke-caution' : 'fill-surface-sunk stroke-line-strong'}
        strokeWidth='1.25'
        strokeDasharray={isStale ? '3 2' : undefined}
      />
      <text
        x={centre}
        y={TABLET.y + 26}
        textAnchor='middle'
        fontSize='16'
        fontWeight='700'
        className='fill-ink'
      >
        {name}
      </text>
      <text
        x={centre}
        y={TABLET.y + 37}
        textAnchor='middle'
        fontSize='6.5'
        letterSpacing='0.6'
        className={isStale ? 'fill-caution font-mono' : 'fill-ink-muted font-mono'}
      >
        {state}
      </text>
      <rect
        x={centre - 12}
        y={TABLET.y + 44}
        width='24'
        height='12'
        rx='6'
        className={isStale ? 'fill-surface stroke-caution' : 'fill-surface stroke-signal'}
        strokeWidth='1.25'
      />
      <text
        x={centre}
        y={TABLET.y + 52.5}
        textAnchor='middle'
        fontSize='7.5'
        fontWeight='600'
        className={isStale ? 'fill-caution font-mono' : 'fill-signal font-mono'}
      >
        {draft}
      </text>
    </g>
  );
}

/**
 * Two tablets, one record. B writes the newer draft first; A comes back from
 * days offline and its older draft lands on top — the write succeeds, and the
 * record reverts.
 */
export function DraftSyncStill() {
  const aCentre = TABLET_A_X + TABLET.width / 2;
  const bCentre = TABLET_B_X + TABLET.width / 2;

  return (
    <StillSvg>
      {/* B syncs first: up from the tablet, then across into the record. */}
      <g className='stroke-signal-bright'>
        <line
          x1={bCentre}
          y1={TABLET.y}
          x2={bCentre}
          y2={SYNC_Y}
          strokeWidth='1.75'
          className='work-still-grow-y'
          style={at(1)}
        />
        <line
          x1={bCentre}
          y1={SYNC_Y}
          x2={RECORD.x + RECORD.width}
          y2={SYNC_Y}
          strokeWidth='1.75'
          className='work-still-grow-x'
          data-from='end'
          style={at(2)}
        />
      </g>
      {/* A syncs last, days later, and wins. */}
      <g
        className='stroke-caution'
        strokeDasharray='4 3'
      >
        <line
          x1={aCentre}
          y1={TABLET.y}
          x2={aCentre}
          y2={SYNC_Y}
          strokeWidth='1.75'
          className='work-still-grow-y'
          style={at(3)}
        />
        <line
          x1={aCentre}
          y1={SYNC_Y}
          x2={RECORD.x}
          y2={SYNC_Y}
          strokeWidth='1.75'
          className='work-still-grow-x'
          style={at(4)}
        />
      </g>

      <rect
        x={RECORD.x}
        y={RECORD.y}
        width={RECORD.width}
        height={RECORD.height}
        rx='6'
        className='fill-surface stroke-line-strong'
        strokeWidth='1.5'
      />
      <text
        x={RECORD.x + RECORD.width / 2}
        y={RECORD.y + 12}
        textAnchor='middle'
        fontSize='6'
        letterSpacing='0.8'
        className='fill-ink-faint font-mono'
      >
        RECORD
      </text>
      <text
        x={RECORD.x + 24}
        y={RECORD.y + 32}
        textAnchor='middle'
        fontSize='13'
        fontWeight='700'
        className='fill-ink-faint font-mono'
      >
        v2
      </text>
      <line
        x1={RECORD.x + 12}
        y1={RECORD.y + 27.5}
        x2={RECORD.x + 36}
        y2={RECORD.y + 27.5}
        strokeWidth='2'
        className='stroke-caution work-still-grow-x'
        style={at(5)}
      />
      <text
        x={RECORD.x + 54}
        y={RECORD.y + 32}
        textAnchor='middle'
        fontSize='13'
        fontWeight='700'
        className='fill-caution work-still-pop font-mono'
        style={at(5)}
      >
        v1
      </text>

      <Tablet
        x={TABLET_A_X}
        name='A'
        state='OFFLINE'
        draft='v1'
        isStale
      />
      <Tablet
        x={TABLET_B_X}
        name='B'
        state='ONLINE'
        draft='v2'
        isStale={false}
      />

      <g transform='rotate(-8 120 100)'>
        <g
          className='work-still-stamp'
          style={at(6)}
        >
          <rect
            x='76'
            y='88'
            width='88'
            height='24'
            rx='4'
            className='fill-caution-wash stroke-caution'
            strokeWidth='2'
          />
          <text
            x='120'
            y='104'
            textAnchor='middle'
            fontSize='10.5'
            fontWeight='700'
            letterSpacing='1.5'
            className='fill-caution font-mono'
          >
            REVERTED
          </text>
        </g>
      </g>
    </StillSvg>
  );
}
