import { ScenePiece, SceneFrame, SceneText } from './scene-parts';
import { ToolMark, type ToolMarkName } from './tool-marks';

const COLUMNS = [54, 160, 266] as const;
/** Where each shelf's marks sit; a label and the shelf's edge sit below. */
const SHELVES = [20, 72, 124, 176, 228] as const;
const LABEL_DROP = 26;
const EDGE_DROP = 33;

const TOOLS: readonly (readonly { mark: ToolMarkName; label: string }[])[] = [
  [
    { mark: 'python', label: 'Python' },
    { mark: 'r', label: 'R' },
    { mark: 'matlab', label: 'MATLAB' },
  ],
  [
    { mark: 'maple', label: 'Maple' },
    { mark: 'mathematica', label: 'Mathematica' },
    { mark: 'redux', label: 'Redux Toolkit' },
  ],
  [
    { mark: 'saga', label: 'Redux Saga' },
    { mark: 'drizzle', label: 'Drizzle' },
    { mark: 'globe', label: 'next-intl' },
  ],
  [
    { mark: 'mdx', label: 'MDX' },
    { mark: 'three', label: 'three.js' },
    { mark: 'gsap', label: 'GSAP' },
  ],
  [
    { mark: 'firebase', label: 'Firebase' },
    { mark: 'figma', label: 'Figma' },
  ],
];

/** The tools used less recently, as a quiet shelf of marks rather than a flow. */
export function SceneArchive() {
  return (
    <SceneFrame
      height={264}
      description='A quieter shelf of tools used less recently: the mathematics tools Python, R, MATLAB, Maple and Mathematica, three.js and GSAP for interactive 3D and motion, and Redux, Drizzle, next-intl, MDX, Firebase and Figma.'
    >
      {TOOLS.map((shelf, row) => {
        const y = SHELVES[row] ?? 0;
        return (
          <ScenePiece
            key={y}
            k={row}
          >
            {shelf.map((tool, column) => (
              <g key={tool.label}>
                <ToolMark
                  name={tool.mark}
                  at={{ x: COLUMNS[column] ?? 0, y }}
                  accent={tool.mark === 'three' || tool.mark === 'gsap'}
                />
                <SceneText at={{ x: COLUMNS[column] ?? 0, y: y + LABEL_DROP }}>{tool.label}</SceneText>
              </g>
            ))}
            <path
              className='stack-scene-rule'
              d={`M4 ${y + EDGE_DROP}H316`}
            />
          </ScenePiece>
        );
      })}
    </SceneFrame>
  );
}
