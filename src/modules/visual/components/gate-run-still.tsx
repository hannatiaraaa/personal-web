import type { GateSuite, PermissionMatrix } from '@/modules/visual/lib/gate-run';
import { GATE_TAG_RADIUS } from '@/modules/visual/lib/gate-run-marks';
import { buildGateRunStill, GATE_STILL_SIZE } from '@/modules/visual/lib/gate-run-still';

type Props = { suite: GateSuite; matrix: PermissionMatrix; description: string };

/**
 * The finished run as SVG: what a reader sees before the canvas loads, without
 * JavaScript, and what a crawler indexes. Same layout as the canvas at its
 * typical size; the canvas replaces it once it has painted.
 */
export function GateRunStill({ suite, matrix, description }: Props) {
  const still = buildGateRunStill(suite, matrix);
  const { width, height } = GATE_STILL_SIZE;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role='img'
      aria-label={description}
      className='gate-run-still-svg'
      fill='none'
    >
      <text
        x={still.suiteLabel.x}
        y={still.suiteLabel.y}
        className='gate-run-still-label'
      >
        {still.suiteLabel.text}
      </text>
      <path
        d={still.specs}
        stroke='var(--line)'
      />
      <path
        d={still.pass}
        stroke='var(--pass)'
        strokeOpacity={still.passOpacity}
        strokeWidth={still.passStroke}
        strokeLinecap='round'
      />
      {still.debt.map((mark) => (
        <g key={mark.label}>
          <circle
            cx={mark.x}
            cy={mark.y}
            r={still.debtRadius}
            fill='var(--caution)'
          />
          <rect
            x={mark.tag.x}
            y={mark.tag.y}
            width={mark.tag.w}
            height={mark.tag.h}
            rx={GATE_TAG_RADIUS}
            fill='var(--caution)'
          />
          <text
            x={mark.tagText.x}
            y={mark.tagText.y}
            textAnchor='middle'
            className='gate-run-still-tag'
          >
            {mark.label}
          </text>
        </g>
      ))}
      <text
        x={still.matrixLabel.x}
        y={still.matrixLabel.y}
        className='gate-run-still-label'
      >
        {still.matrixLabel.text}
      </text>
      <path
        d={still.allow}
        fill='var(--pass)'
      />
      <path
        d={still.deny}
        stroke='var(--ink-muted)'
      />
    </svg>
  );
}
