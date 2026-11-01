import { chainLinks, pointsOnLoop } from '../../lib';
import { SceneArrow, SceneFrame, SceneNode, ScenePiece, SceneText } from './scene-parts';
import { ToolMark, type ToolMarkName } from './tool-marks';

const NODE = { width: 76, height: 28 } as const;
const CENTRE = { x: 160, y: 122 } as const;
const STAGES = ['spec', 'agent', 'tests', 'review', 'merge'] as const;
const POINTS = pointsOnLoop(STAGES.length, CENTRE, 86);
const LINKS = chainLinks(POINTS, { halfWidth: NODE.width / 2, halfHeight: NODE.height / 2, margin: 3, isClosed: true });

/** The agents she works with, one in each corner: the loop is the same whichever runs it. */
const AGENTS: readonly {
  mark: ToolMarkName;
  label: string;
  markAt: { x: number; y: number };
  labelAt: { x: number; y: number };
  anchor: 'start' | 'middle' | 'end';
}[] = [
  { mark: 'claude', label: 'Claude Code', markAt: { x: 44, y: 16 }, labelAt: { x: 44, y: 46 }, anchor: 'middle' },
  { mark: 'chatgpt', label: 'ChatGPT', markAt: { x: 276, y: 16 }, labelAt: { x: 276, y: 46 }, anchor: 'middle' },
  { mark: 'copilot', label: 'Copilot', markAt: { x: 31, y: 196 }, labelAt: { x: 4, y: 226 }, anchor: 'start' },
  { mark: 'antigravity', label: 'Antigravity', markAt: { x: 273, y: 196 }, labelAt: { x: 316, y: 226 }, anchor: 'end' },
];

/**
 * Delivery with an agent as a loop: spec, agent, tests, review, merge and back
 * to the next spec. The agents sit round it, because the loop and its gates do
 * not depend on which one runs.
 */
export function SceneAiDelivery() {
  return (
    <SceneFrame
      height={232}
      description='Delivery with an agent as a loop that does not depend on the tool: a spec goes to an agent, whether Claude Code, ChatGPT, GitHub Copilot or Antigravity, whose work has to pass the tests and a review before it merges, and the next spec starts from there.'
    >
      <ScenePiece k={0}>
        {AGENTS.map((agent) => (
          <g key={agent.label}>
            <ToolMark
              name={agent.mark}
              at={agent.markAt}
              accent
            />
            <SceneText
              at={agent.labelAt}
              anchor={agent.anchor}
            >
              {agent.label}
            </SceneText>
          </g>
        ))}
        <SceneText at={{ x: CENTRE.x, y: CENTRE.y + 4.5 }}>any agent</SceneText>
      </ScenePiece>

      {STAGES.map((stage, index) => (
        <SceneNode
          key={stage}
          centre={POINTS[index] ?? CENTRE}
          width={NODE.width}
          height={NODE.height}
          k={1 + index * 2}
          accent={stage === 'tests'}
        >
          <SceneText at={{ x: POINTS[index]?.x ?? 0, y: (POINTS[index]?.y ?? 0) + 4.5 }}>{stage}</SceneText>
        </SceneNode>
      ))}
      {LINKS.map((link, index) => (
        <SceneArrow
          key={STAGES[index]}
          {...link}
          k={2 + index * 2}
        />
      ))}
    </SceneFrame>
  );
}
