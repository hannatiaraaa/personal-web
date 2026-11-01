import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/** Lines of a diff: `kind` is whether the line was added, removed or kept. */
const DIFF = [
  { kind: 'kept', length: 84 },
  { kind: 'removed', length: 70 },
  { kind: 'added', length: 96 },
  { kind: 'added', length: 62 },
  { kind: 'kept', length: 78 },
] as const;

const DIFF_STROKE = {
  kept: 'var(--ink-faint)',
  removed: 'var(--caution)',
  added: 'var(--signal)',
} as const;

/** The records a change has to trace to, right of the pull request. */
const RECORDS = [
  { y: 40, label: 'ADR' },
  { y: 86, label: 'runbook' },
  { y: 132, label: 'docs' },
] as const;
const RECORD_STAGGER = 0.2;

/** Reviewer of record: every change traced to the decision behind it. */
export function SceneReviewRecord() {
  return (
    <SceneFrame finding='A pull request approved against the decision record, runbook and documentation that ship with it, so every change traces to a decision, a date and a reason.'>
      {/* Pull request */}
      <rect
        x='20'
        y='30'
        width='160'
        height='136'
        rx='10'
        fill='var(--surface)'
        stroke='var(--line-strong)'
        strokeWidth='1.4'
      />
      <text
        x='32'
        y='50'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        pull request
      </text>
      {DIFF.map((line, index) => (
        <line
          key={index}
          x1='40'
          x2={40 + line.length}
          y1={70 + index * 16}
          y2={70 + index * 16}
          stroke={DIFF_STROKE[line.kind]}
          strokeWidth='3'
          strokeLinecap='round'
        />
      ))}

      {/* Approval stamp */}
      <g
        className='scene-in-pop'
        style={enterAfter(0.8)}
      >
        <circle
          cx='160'
          cy='150'
          r='16'
          fill='var(--signal)'
        />
        <path
          d='M152 150 l5 5 l10 -11'
          stroke='var(--surface)'
          strokeWidth='2.4'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>

      {RECORDS.map((record, index) => (
        <g
          key={record.label}
          className='scene-in-slide'
          style={enterAfter(index * RECORD_STAGGER)}
        >
          <path
            d={`M182 ${record.y + 14} H214`}
            stroke='var(--signal-cyan)'
            strokeWidth='1.4'
            strokeDasharray='3 3'
          />
          <path
            d={`M218 ${record.y} h62 l10 10 v20 h-72 Z`}
            fill='var(--signal-wash)'
            stroke='var(--signal)'
            strokeWidth='1.4'
            strokeLinejoin='round'
          />
          <text
            x='228'
            y={record.y + 19}
            className={sceneLabel}
            fill='var(--ink)'
          >
            {record.label}
          </text>
        </g>
      ))}
    </SceneFrame>
  );
}
