import { SceneFrame, sceneLabel } from './scene-frame';

/** Rows of a screen. The two native copies disagree; the unified one does not. */
const KOTLIN_ROWS = [34, 22, 28] as const;
const SWIFT_ROWS = [26, 34, 18] as const;
const UNIFIED_ROWS = [40, 40, 40] as const;
const ROW_GAP = 14;

function Phone({
  x,
  y,
  width,
  height,
  rows,
  isUnified = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: readonly number[];
  isUnified?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx='10'
        fill={isUnified ? 'var(--signal-wash)' : 'var(--surface-sunk)'}
        stroke={isUnified ? 'var(--signal)' : 'var(--line-strong)'}
        strokeWidth={isUnified ? 1.6 : 1.2}
      />
      {rows.map((length, index) => (
        <line
          key={index}
          x1={x + 10}
          x2={x + 10 + length}
          y1={y + 24 + index * ROW_GAP}
          y2={y + 24 + index * ROW_GAP}
          stroke={isUnified ? 'var(--signal)' : 'var(--ink-faint)'}
          strokeWidth='3'
          strokeLinecap='round'
        />
      ))}
    </g>
  );
}

/** 2021–2023: one patient app that existed twice, unified into one codebase. */
export function SceneOneCodebase() {
  return (
    <SceneFrame finding='One patient app that existed twice, in Kotlin and in Swift and drifting apart, unified onto a single React Native codebase.'>
      <g className='scene-app-left'>
        <Phone
          x={18}
          y={44}
          width={62}
          height={104}
          rows={KOTLIN_ROWS}
        />
        <text
          x='49'
          y='168'
          textAnchor='middle'
          className={sceneLabel}
          fill='var(--ink-muted)'
        >
          kotlin
        </text>
      </g>

      <g className='scene-app-right'>
        <Phone
          x={240}
          y={44}
          width={62}
          height={104}
          rows={SWIFT_ROWS}
        />
        <text
          x='271'
          y='168'
          textAnchor='middle'
          className={sceneLabel}
          fill='var(--ink-muted)'
        >
          swift
        </text>
      </g>

      <g
        className='scene-merge'
        stroke='var(--signal-cyan)'
        strokeWidth='1.4'
        strokeLinecap='round'
      >
        <path d='M84 80 C104 80 104 96 120 96' />
        <path d='M84 112 C104 112 104 96 120 96' />
        <path d='M236 80 C216 80 216 96 200 96' />
        <path d='M236 112 C216 112 216 96 200 96' />
      </g>

      <g className='scene-app-unified'>
        <Phone
          x={124}
          y={30}
          width={72}
          height={130}
          rows={UNIFIED_ROWS}
          isUnified
        />
        <text
          x='160'
          y='184'
          textAnchor='middle'
          className={sceneLabel}
          fill='var(--signal)'
        >
          one codebase
        </text>
      </g>
    </SceneFrame>
  );
}
