import { at, StillSvg } from './story-still-frame';

const NODE_HEIGHT = 18;
const LADDER_CENTRE = 59;

/** The ladder a customer configured: two in sequence, two in parallel, then approved. */
const NODES = [
  { label: 'REQUESTER', x: 24, y: 10, width: 70 },
  { label: 'BUDGET OWNER', x: 24, y: 42, width: 70 },
  { label: 'OPERATIONS', x: 9, y: 76, width: 48 },
  { label: 'PURCHASING', x: 61, y: 76, width: 48 },
] as const;
const APPROVED = { x: 24, y: 112, width: 70 } as const;

const CONFIG = { x: 120, y: 10, width: 108, height: 100 } as const;
const TOGGLE = { x: 198, width: 22, height: 11 } as const;

function Node({ label, x, y, width, order }: { label: string; x: number; y: number; width: number; order: number }) {
  return (
    <g
      className='work-still-pop'
      style={at(order)}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={NODE_HEIGHT}
        rx={NODE_HEIGHT / 2}
        className='fill-surface stroke-line-strong'
        strokeWidth='1.25'
      />
      <text
        x={x + width / 2}
        y={y + 11.5}
        textAnchor='middle'
        fontSize='6'
        letterSpacing='0.4'
        className='fill-ink-muted font-mono'
      >
        {label}
      </text>
    </g>
  );
}

function Toggle({ y, order }: { y: number; order: number }) {
  return (
    <g>
      <rect
        x={TOGGLE.x}
        y={y}
        width={TOGGLE.width}
        height={TOGGLE.height}
        rx={TOGGLE.height / 2}
        className='fill-signal'
      />
      <circle
        cx={TOGGLE.x + TOGGLE.width - TOGGLE.height / 2}
        cy={y + TOGGLE.height / 2}
        r='3.8'
        className='fill-surface work-still-slide'
        style={at(order)}
      />
    </g>
  );
}

function ConfigLabel({ y, children }: { y: number; children: string }) {
  return (
    <text
      x={CONFIG.x + 10}
      y={y}
      fontSize='7'
      className='fill-ink-muted'
    >
      {children}
    </text>
  );
}

/**
 * The approval ladder as configuration: the business sets the steps, the
 * spending limit and the price check, and the per-customer branch it replaced
 * is struck out.
 */
export function ApprovalStill() {
  return (
    <StillSvg>
      <path
        d={`M${LADDER_CENTRE} 28 V42 M${LADDER_CENTRE} 60 V68 H33 V76 M${LADDER_CENTRE} 68 H85 V76 M33 94 V104 H85 V94 M${LADDER_CENTRE} 104 V112`}
        fill='none'
        strokeWidth='1.25'
        className='stroke-line-strong'
      />
      {NODES.map((node, index) => (
        <Node
          key={node.label}
          {...node}
          order={index}
        />
      ))}
      <g
        className='work-still-pop'
        style={at(NODES.length)}
      >
        <rect
          x={APPROVED.x}
          y={APPROVED.y}
          width={APPROVED.width}
          height={NODE_HEIGHT}
          rx={NODE_HEIGHT / 2}
          className='fill-signal-wash stroke-signal'
          strokeWidth='1.5'
        />
        <text
          x={APPROVED.x + APPROVED.width / 2}
          y={APPROVED.y + 11.5}
          textAnchor='middle'
          fontSize='6.5'
          fontWeight='700'
          letterSpacing='0.6'
          className='fill-signal font-mono'
        >
          APPROVED ✓
        </text>
      </g>

      <rect
        x={CONFIG.x}
        y={CONFIG.y}
        width={CONFIG.width}
        height={CONFIG.height}
        rx='6'
        className='fill-surface stroke-line-strong'
        strokeWidth='1.25'
      />
      <text
        x={CONFIG.x + 10}
        y={CONFIG.y + 15}
        fontSize='6'
        letterSpacing='0.8'
        className='fill-ink-faint font-mono'
      >
        LADDER · CONFIGURED
      </text>

      <ConfigLabel y={42}>Parallel step</ConfigLabel>
      <Toggle
        y={34}
        order={1}
      />

      <ConfigLabel y={64}>Spending limit</ConfigLabel>
      <rect
        x={CONFIG.x + 10}
        y='70'
        width={CONFIG.width - 20}
        height='3'
        rx='1.5'
        className='fill-line-strong'
      />
      <rect
        x={CONFIG.x + 10}
        y='70'
        width='58'
        height='3'
        rx='1.5'
        className='fill-signal work-still-grow-x'
        style={at(2)}
      />

      <ConfigLabel y={96}>Price check</ConfigLabel>
      <Toggle
        y={88}
        order={3}
      />

      <rect
        x={CONFIG.x}
        y='118'
        width={CONFIG.width}
        height='20'
        rx='4'
        className='fill-caution-wash'
      />
      <text
        x={CONFIG.x + CONFIG.width / 2}
        y='131'
        textAnchor='middle'
        fontSize='7'
        className='fill-caution font-mono'
      >
        if (customer === &apos;B&apos;)
      </text>
      <line
        x1={CONFIG.x + 8}
        y1='128.5'
        x2={CONFIG.x + CONFIG.width - 8}
        y2='128.5'
        strokeWidth='1.5'
        className='stroke-caution work-still-grow-x'
        style={at(6)}
      />
    </StillSvg>
  );
}
