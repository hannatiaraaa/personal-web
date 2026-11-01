import { chainLinks } from '../../lib';
import { SceneArrow, SceneFrame, SceneNode, ScenePiece, SceneText } from './scene-parts';
import { ToolMark } from './tool-marks';

const NODE = { width: 62, height: 62 } as const;
const STAGES = [
  { at: { x: 40, y: 58 }, mark: 'pull-request', label: 'PR' },
  { at: { x: 120, y: 58 }, mark: 'review', label: 'review' },
  { at: { x: 200, y: 58 }, mark: 'gate', label: 'gate' },
  { at: { x: 280, y: 58 }, mark: 'release', label: 'release' },
] as const;
const LINKS = chainLinks(
  STAGES.map((stage) => stage.at),
  { halfWidth: NODE.width / 2, halfHeight: NODE.height / 2, margin: 2 },
);

/** Each cell of the permission matrix the gate runs: most allowed, one refused. */
const MATRIX = [
  { x: 180, y: 118, isAllowed: true },
  { x: 200, y: 118, isAllowed: true },
  { x: 220, y: 118, isAllowed: false },
  { x: 180, y: 136, isAllowed: true },
  { x: 200, y: 136, isAllowed: false },
  { x: 220, y: 136, isAllowed: true },
] as const;
/** The box the matrix is drawn in, under the gate. */
const MATRIX_BOX = { x: 168, y: 106, width: 64, height: 42 } as const;
const TICK = 'm-4 0 3 3 5-6';
const CROSS = 'm-4-4 8 8m0-8-8 8';

/**
 * A release as a pipeline: a pull request through review and the gate to
 * release, the gate running its permission matrix, and the decision behind a
 * change kept as a record off to the side.
 */
export function SceneArchitecture() {
  return (
    <SceneFrame
      height={200}
      description='A release as a pipeline: a pull request goes through review, then a gate that runs the permission matrix, before it is released, with the decision behind it kept as a record beside the review.'
    >
      {STAGES.map((stage, index) => (
        <SceneNode
          key={stage.label}
          centre={stage.at}
          width={NODE.width}
          height={NODE.height}
          k={index * 2}
          accent={stage.mark === 'gate'}
        >
          <ToolMark
            name={stage.mark}
            at={{ x: stage.at.x, y: 48 }}
            accent={stage.mark === 'gate'}
          />
          <SceneText at={{ x: stage.at.x, y: 80 }}>{stage.label}</SceneText>
        </SceneNode>
      ))}
      {LINKS.map((link, index) => (
        <SceneArrow
          key={link.from.x}
          {...link}
          k={1 + index * 2}
        />
      ))}

      <ScenePiece k={7}>
        <path
          className='stack-scene-link stack-scene-link-dashed'
          d='M200 91V106'
        />
        <rect
          {...MATRIX_BOX}
          rx='6'
          className='stack-scene-box'
        />
        {MATRIX.map((cell) => (
          <path
            key={`${cell.x},${cell.y}`}
            className={cell.isAllowed ? 'stack-scene-tick' : 'stack-scene-cross'}
            d={`M${cell.x} ${cell.y}${cell.isAllowed ? TICK : CROSS}`}
          />
        ))}
        {/* Set from the matrix's left edge: centred, it ran back into the ADR box. */}
        <SceneText
          minor
          anchor='start'
          at={{ x: MATRIX_BOX.x, y: 166 }}
        >
          permission matrix
        </SceneText>
      </ScenePiece>

      <SceneArrow
        from={{ x: 120, y: 91 }}
        to={{ x: 120, y: 134 }}
        k={8}
        dashed
      />
      <SceneNode
        centre={{ x: 120, y: 160 }}
        width={70}
        height={48}
        k={9}
      >
        <ToolMark
          name='document'
          at={{ x: 102, y: 160 }}
          scale={0.85}
        />
        <SceneText
          anchor='start'
          at={{ x: 116, y: 165 }}
        >
          ADR
        </SceneText>
        <SceneText
          minor
          anchor='start'
          at={{ x: 6, y: 165 }}
        >
          decision
        </SceneText>
      </SceneNode>
    </SceneFrame>
  );
}
