import { SceneFrame, sceneLabel } from './scene-frame';

/** Rows in the run, each a different case; the width only keeps them distinct. */
const CASES = [
  { y: 36, length: 72 },
  { y: 62, length: 54 },
  { y: 88, length: 86 },
  { y: 114, length: 62 },
  { y: 140, length: 78 },
] as const;

const ROW = { x: 28, width: 132, height: 18 } as const;
const CHECK_X = 178;
/** The barrier arm pivots on the left post. */
const PIVOT = { x: 236, y: 92 } as const;
const ARM_RAISED_DEG = -78;

/** A release that passes only once the whole run has. */
export function SceneReleaseGate() {
  return (
    <SceneFrame finding='A release held at a gate until every repeatable case and authorization check in the run has passed, and only then let through.'>
      <text
        x={ROW.x}
        y='24'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        the run
      </text>

      <g>
        {CASES.map((row) => (
          <g
            key={row.y}
            className='scene-case'
          >
            <rect
              x={ROW.x}
              y={row.y}
              width={ROW.width}
              height={ROW.height}
              rx='4'
              fill='var(--surface-sunk)'
              stroke='var(--line)'
            />
            <line
              x1={ROW.x + 10}
              x2={ROW.x + 10 + row.length}
              y1={row.y + 9}
              y2={row.y + 9}
              stroke='var(--ink-faint)'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <g className='scene-case-check'>
              <circle
                cx={CHECK_X}
                cy={row.y + 9}
                r='7'
                fill='var(--signal)'
              />
              <path
                d={`M${CHECK_X - 3.5} ${row.y + 9} l2.5 2.5 l4.5 -5`}
                stroke='var(--surface)'
                strokeWidth='1.6'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </g>
          </g>
        ))}
      </g>

      {/* Gate: two posts and a barrier arm, raised. */}
      <rect
        x='230'
        y='78'
        width='6'
        height='80'
        rx='2'
        fill='var(--ink-faint)'
      />
      <rect
        x='290'
        y='78'
        width='6'
        height='80'
        rx='2'
        fill='var(--ink-faint)'
      />
      <g className='scene-gate-arm'>
        <rect
          x={PIVOT.x}
          y={PIVOT.y - 3}
          width='54'
          height='6'
          rx='3'
          fill='var(--signal)'
          transform={`rotate(${ARM_RAISED_DEG} ${PIVOT.x} ${PIVOT.y})`}
        />
      </g>

      <g className='scene-release'>
        <path
          d='M196 150 H310 M302 144 L310 150 L302 156'
          stroke='var(--signal-cyan)'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <text
        x='263'
        y='180'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        release
      </text>
    </SceneFrame>
  );
}
