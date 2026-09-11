import { DiagramFrame, diagramLabel } from './diagram-frame';

/**
 * Three levels each applying tax individually correctly, composing into a
 * wrong total — beside the one ladder that has no second rung to compound.
 */
export function TaxLadderDiagram() {
  const col = { before: 60, after: 360 };
  const rows = [
    { y: 66, text: 'item line' },
    { y: 106, text: 'service scope' },
    { y: 146, text: 'document' },
  ] as const;

  return (
    <DiagramFrame
      viewBox='0 0 620 210'
      title='Tax applied at three levels composes: a level can tax an amount a level below it already taxed. One ladder has a single rung where tax happens, so there is no second one to compound.'
      description='Left: three stacked levels — item line, service scope and document — each applying tax, with arrows showing tax compounding upward. Right: one ladder where subtotal and discount resolve first and tax is applied once, at a single rung.'
    >
      {/* before */}
      <text
        x={col.before}
        y='34'
        className={diagramLabel}
        fill='var(--ink-faint)'
      >
        BEFORE — tax at every level
      </text>
      {rows.map(({ y, text }, i) => (
        <g key={text}>
          <rect
            x={col.before}
            y={y}
            width='190'
            height='28'
            rx='4'
            stroke='var(--line-strong)'
            strokeWidth='1'
            fill='var(--surface-sunk)'
          />
          <text
            x={col.before + 12}
            y={y + 18}
            className={diagramLabel}
            fill='var(--ink)'
          >
            {text} + tax
          </text>
          {i < rows.length - 1 && (
            <path
              d={`M${col.before + 220} ${y + 14} h22 v40 h-22`}
              stroke='var(--signal)'
              strokeWidth='1.3'
              strokeLinecap='round'
            />
          )}
        </g>
      ))}
      <text
        x={col.before}
        y='194'
        className={diagramLabel}
        fill='var(--signal)'
      >
        tax can land on taxed money
      </text>

      {/* after */}
      <text
        x={col.after}
        y='34'
        className={diagramLabel}
        fill='var(--ink-faint)'
      >
        AFTER — one ladder
      </text>
      {(
        [
          { y: 66, text: 'subtotal at source grain' },
          { y: 106, text: 'discount' },
          { y: 146, text: 'tax — once' },
        ] as const
      ).map(({ y, text }, i) => (
        <g key={text}>
          <rect
            x={col.after}
            y={y}
            width='200'
            height='28'
            rx='4'
            stroke={i === 2 ? 'var(--signal)' : 'var(--line-strong)'}
            strokeWidth={i === 2 ? '1.6' : '1'}
            fill={i === 2 ? 'var(--signal-wash)' : 'var(--surface-sunk)'}
          />
          <text
            x={col.after + 12}
            y={y + 18}
            className={diagramLabel}
            fill='var(--ink)'
          >
            {text}
          </text>
          {i < 2 && (
            <path
              d={`M${col.after + 100} ${y + 28} v12`}
              stroke='var(--line-strong)'
              strokeWidth='1.2'
              strokeLinecap='round'
            />
          )}
        </g>
      ))}
      <text
        x={col.after}
        y='194'
        className={diagramLabel}
        fill='var(--ink-muted)'
      >
        no second rung exists
      </text>
    </DiagramFrame>
  );
}
