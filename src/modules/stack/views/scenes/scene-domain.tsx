import { chainLinks, type ScenePoint } from '../../lib';
import { SceneArrow, SceneFrame, SceneNode, ScenePiece, SceneText } from './scene-parts';
import { ToolMark, type ToolMarkName } from './tool-marks';

const NODE = { width: 100, height: 26 } as const;
/** The rows the steps of a lane sit on, top to bottom. */
const ROWS = [78, 118, 158, 198, 238] as const;

type Step = { readonly label: string; readonly mark?: ToolMarkName };
type Lane = {
  readonly x: number;
  readonly mark: ToolMarkName;
  readonly title: string;
  readonly steps: readonly Step[];
};

const LANES: readonly Lane[] = [
  {
    x: 54,
    mark: 'vessel',
    title: 'B2B fleet',
    steps: [
      { label: 'vessel' },
      { label: 'work order' },
      { label: 'requisition' },
      { label: 'approval' },
      { label: 'SAP', mark: 'sap' },
    ],
  },
  {
    x: 160,
    mark: 'dna',
    title: 'B2C health',
    steps: [{ label: 'patient app' }, { label: 'DNA report' }, { label: 'encrypted', mark: 'lock' }],
  },
  {
    x: 266,
    mark: 'model',
    title: 'Applied maths',
    steps: [{ label: 'model' }, { label: 'simulation' }, { label: 'paper' }],
  },
];

/** A step's place in its lane, which is its row. */
function stepAt(lane: Lane, row: number): ScenePoint {
  return { x: lane.x, y: ROWS[row] ?? 0 };
}

/** How far a step's label sits right of its centre when a mark goes before it. */
const MARKED_LABEL_SHIFT = 9;
/** How far that mark sits left of the step's centre. */
const MARK_OFFSET = 36;

/**
 * Three domains side by side, each one short flow read downwards: fleet
 * maintenance and procurement, a patient health app, and applied mathematics.
 * The three lanes draw in together, a row at a time.
 */
export function SceneDomain() {
  return (
    <SceneFrame
      height={254}
      description='Three domains as three short flows: fleet maintenance from a vessel through work order, requisition and approval to SAP; a patient health app whose DNA reports are encrypted at rest; and applied mathematics from model to simulation to paper.'
    >
      <ScenePiece k={0}>
        {LANES.map((lane) => (
          <g key={lane.title}>
            <ToolMark
              name={lane.mark}
              at={{ x: lane.x, y: 16 }}
              accent
            />
            <SceneText at={{ x: lane.x, y: 46 }}>{lane.title}</SceneText>
          </g>
        ))}
        <path
          className='stack-scene-rule'
          d='M4 56H316'
        />
      </ScenePiece>

      {LANES.map((lane) => {
        const centres = lane.steps.map((_, row) => stepAt(lane, row));
        const links = chainLinks(centres, { halfWidth: NODE.width / 2, halfHeight: NODE.height / 2, margin: 2 });
        return (
          <g key={lane.title}>
            {lane.steps.map((step, row) => (
              <SceneNode
                key={step.label}
                centre={stepAt(lane, row)}
                width={NODE.width}
                height={NODE.height}
                k={1 + row * 2}
              >
                {step.mark ? (
                  <ToolMark
                    name={step.mark}
                    at={{ x: lane.x - MARK_OFFSET, y: ROWS[row] ?? 0 }}
                    scale={0.62}
                    accent
                  />
                ) : null}
                <SceneText at={{ x: step.mark ? lane.x + MARKED_LABEL_SHIFT : lane.x, y: (ROWS[row] ?? 0) + 4.5 }}>
                  {step.label}
                </SceneText>
              </SceneNode>
            ))}
            {links.map((link, row) => (
              <SceneArrow
                key={link.from.y}
                {...link}
                k={2 + row * 2}
              />
            ))}
          </g>
        );
      })}
    </SceneFrame>
  );
}
