import { SceneFrame, sceneLabel } from './scene-frame';

/**
 * Bottom to top: the request, then each approval tier. `authority` is the
 * drawn width of that approver's spending limit — it widens up the ladder.
 */
const RUNGS = [
  { y: 156, label: 'request', authority: 0 },
  { y: 116, label: 'tier 1', authority: 22 },
  { y: 76, label: 'tier 2', authority: 40 },
  { y: 36, label: 'tier 3', authority: 58 },
] as const;

const RUNG = { x: 52, width: 216, height: 28 } as const;
const AUTHORITY_X = 150;
const CHECK_X = 248;

/** Approval rules taken end to end, tier by tier. */
export function SceneApprovalLadder() {
  return (
    <SceneFrame finding='A purchase request climbing a multi-tier approval ladder, each tier signing off only within its approver’s spending authority.'>
      <text
        x={AUTHORITY_X}
        y='24'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        authority
      </text>

      <g>
        {RUNGS.map((rung, index) => (
          <g
            key={rung.label}
            className='scene-rung'
          >
            {index > 0 && (
              <path
                d={`M160 ${rung.y + RUNG.height + 10} V${rung.y + RUNG.height + 2}`}
                stroke='var(--line-strong)'
                strokeWidth='1.4'
              />
            )}
            <rect
              x={RUNG.x}
              y={rung.y}
              width={RUNG.width}
              height={RUNG.height}
              rx='5'
              fill='var(--surface-sunk)'
              stroke='var(--line-strong)'
            />
            <rect
              x={RUNG.x}
              y={rung.y}
              width={RUNG.width}
              height={RUNG.height}
              rx='5'
              fill='var(--signal-wash)'
              stroke='var(--signal)'
              strokeWidth='1.3'
              className='scene-rung-lit'
            />
            <text
              x={RUNG.x + 12}
              y={rung.y + 18}
              className={sceneLabel}
              fill='var(--ink)'
            >
              {rung.label}
            </text>
            {rung.authority > 0 && (
              <rect
                x={AUTHORITY_X}
                y={rung.y + 11}
                width={rung.authority}
                height='6'
                rx='3'
                fill='var(--sky-mid)'
              />
            )}
            <g className='scene-rung-check'>
              <circle
                cx={CHECK_X}
                cy={rung.y + 14}
                r='7'
                fill='var(--signal)'
              />
              <path
                d={`M${CHECK_X - 3.5} ${rung.y + 14} l2.5 2.5 l4.5 -5`}
                stroke='var(--surface)'
                strokeWidth='1.6'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </g>
          </g>
        ))}
      </g>
    </SceneFrame>
  );
}
