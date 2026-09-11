import { DiagramFrame, diagramLabel } from './diagram-frame';

const LANE_START = 112;
const LANE_END = 686;

const laneA = 84;
const laneB = 162;
const axis = 214;

const readAt = 200;
const writeAt = 366;
const returnAt = 520;

/**
 * Two devices, one record. The interesting part is not that they conflict — it
 * is that without an ownership statement nothing in the model could fail, so
 * the stale write succeeded silently. The guard is what makes it fail.
 */
export function DraftOwnershipDiagram() {
  return (
    <DiagramFrame
      viewBox='0 0 720 240'
      title="Both devices read the same record. The online device moves it on. Without an ownership statement the returning device's older draft was applied on top; the late-draft guard rejects it instead."
      description='A timeline with two device lanes. Both devices read revision one of a record. The online device writes revision two. The device that was offline for days returns holding a draft built from revision one, and the late-draft-sync guard rejects it rather than letting it overwrite revision two.'
    >
      {(
        [
          { y: laneA, name: 'Device A', note: 'offline, days' },
          { y: laneB, name: 'Device B', note: 'online' },
        ] as const
      ).map(({ y, name, note }) => (
        <g key={name}>
          <text
            x='8'
            y={y - 32}
            className={diagramLabel}
            fill='var(--ink)'
          >
            {name}
          </text>
          <text
            x='8'
            y={y - 16}
            className={diagramLabel}
            fill='var(--ink-faint)'
          >
            {note}
          </text>
          <line
            x1={LANE_START}
            y1={y}
            x2={LANE_END}
            y2={y}
            stroke='var(--line)'
            strokeWidth='1'
            strokeDasharray='3 4'
          />
        </g>
      ))}

      {/* time axis */}
      <line
        x1={LANE_START}
        y1={axis}
        x2={LANE_END}
        y2={axis}
        stroke='var(--line-strong)'
        strokeWidth='1'
      />
      <path
        d={`M${LANE_END - 6} ${axis - 4}l6 4-6 4`}
        stroke='var(--line-strong)'
        strokeWidth='1.2'
        strokeLinecap='round'
      />
      <text
        x='8'
        y={axis + 4}
        className={diagramLabel}
        fill='var(--ink-faint)'
      >
        time
      </text>

      {/* both devices read revision 1 */}
      <line
        x1={readAt}
        y1={laneA}
        x2={readAt}
        y2={laneB}
        stroke='var(--line-strong)'
        strokeWidth='1'
      />
      {[laneA, laneB].map((y) => (
        <circle
          key={y}
          cx={readAt}
          cy={y}
          r='4.5'
          fill='var(--ink-muted)'
        />
      ))}
      <text
        x={readAt}
        y={laneB + 26}
        textAnchor='middle'
        className={diagramLabel}
        fill='var(--ink-muted)'
      >
        both read rev 1
      </text>

      {/* the online device moves the record on */}
      <circle
        cx={writeAt}
        cy={laneB}
        r='4.5'
        fill='var(--ink)'
      />
      <text
        x={writeAt}
        y={laneB + 26}
        textAnchor='middle'
        className={diagramLabel}
        fill='var(--ink)'
      >
        writes rev 2
      </text>

      {/* the returning device still holds a revision 1 draft */}
      <circle
        cx={returnAt}
        cy={laneA}
        r='4.5'
        fill='var(--signal)'
      />
      <text
        x={returnAt}
        y={laneA - 16}
        textAnchor='middle'
        className={diagramLabel}
        fill='var(--signal)'
      >
        returns holding a rev 1 draft
      </text>
      <path
        d={`M${returnAt} ${laneA + 8} L${returnAt} ${laneB - 10}`}
        stroke='var(--signal)'
        strokeWidth='1.4'
        strokeDasharray='4 4'
      />

      {/* what the guard now does with it */}
      <g transform={`translate(${returnAt - 7}, ${laneB - 7})`}>
        <path
          d='M0 0l14 14M14 0L0 14'
          stroke='var(--signal)'
          strokeWidth='1.8'
          strokeLinecap='round'
        />
      </g>
      <text
        x={returnAt + 96}
        y={laneB + 4}
        textAnchor='middle'
        className={diagramLabel}
        fill='var(--signal)'
      >
        late-draft guard rejects
      </text>
    </DiagramFrame>
  );
}
