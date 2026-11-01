import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/** The calculation order, top to bottom. Each step reads only the one above it. */
const STEPS = ['line items', 'discount', 'subtotal', 'tax', 'total'] as const;
const STEP = { x: 24, width: 132, height: 24, top: 18, gap: 10 } as const;
const STEP_STAGGER = 0.2;

function stepY(index: number) {
  return STEP.top + index * (STEP.height + STEP.gap);
}

/** Procurement: one calculation order, then the handoff to SAP. */
export function SceneTaxOrder() {
  const taxY = stepY(STEPS.indexOf('tax'));
  const subtotalY = stepY(STEPS.indexOf('subtotal'));
  const totalY = stepY(STEPS.length - 1);

  return (
    <SceneFrame finding='One calculation order from line items to total, each step reading only the one before it, so tax is never charged on tax; the total hands off to SAP, which stays the system of record.'>
      {STEPS.map((label, index) => {
        const y = stepY(index);
        const isTotal = index === STEPS.length - 1;
        return (
          <g
            key={label}
            className='scene-in-slide'
            style={enterAfter(index * STEP_STAGGER)}
          >
            <rect
              x={STEP.x}
              y={y}
              width={STEP.width}
              height={STEP.height}
              rx='5'
              fill={isTotal ? 'var(--signal-wash)' : 'var(--surface-sunk)'}
              stroke={isTotal ? 'var(--signal)' : 'var(--line-strong)'}
              strokeWidth={isTotal ? 1.6 : 1.2}
            />
            <text
              x={STEP.x + 12}
              y={y + 16}
              className={sceneLabel}
              fill='var(--ink)'
            >
              {label}
            </text>
            {index > 0 && (
              <path
                d={`M${STEP.x + STEP.width / 2} ${y - STEP.gap + 1} V${y - 1}`}
                stroke='var(--signal-cyan)'
                strokeWidth='1.6'
              />
            )}
          </g>
        );
      })}

      {/* The loop that is not allowed: tax read back into its own base. */}
      <g
        className='scene-in-fade'
        style={enterAfter(0.9)}
      >
        <path
          d={`M${STEP.x + STEP.width} ${taxY + 12} C${STEP.x + STEP.width + 34} ${taxY + 12} ${STEP.x + STEP.width + 34} ${subtotalY + 12} ${STEP.x + STEP.width + 4} ${subtotalY + 12}`}
          stroke='var(--caution)'
          strokeWidth='1.6'
          strokeDasharray='3 4'
        />
        <path
          d={`M${STEP.x + STEP.width + 20} ${taxY - 6} l10 10 m0 -10 l-10 10`}
          stroke='var(--caution)'
          strokeWidth='2.2'
          strokeLinecap='round'
        />
      </g>
      <text
        x='196'
        y={subtotalY + 8}
        className={sceneLabel}
        fill='var(--caution)'
      >
        no tax on tax
      </text>

      {/* Handoff to the system of record. */}
      <g
        className='scene-in-pop'
        style={enterAfter(1.1)}
      >
        <path
          d={`M${STEP.x + STEP.width + 6} ${totalY + 12} H236 M228 ${totalY + 6} L236 ${totalY + 12} L228 ${totalY + 18}`}
          stroke='var(--signal)'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <rect
          x='242'
          y={totalY - 4}
          width='60'
          height='32'
          rx='6'
          fill='var(--surface)'
          stroke='var(--signal)'
          strokeWidth='1.6'
        />
        <text
          x='272'
          y={totalY + 16}
          textAnchor='middle'
          className={sceneLabel}
          fill='var(--signal)'
        >
          SAP
        </text>
      </g>
    </SceneFrame>
  );
}
