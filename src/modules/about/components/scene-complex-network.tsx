import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/** Agents in a contact network. `isAffected` is the state the contact passes on. */
const NODES = [
  { x: 52, y: 62, isAffected: true },
  { x: 96, y: 38, isAffected: true },
  { x: 104, y: 92, isAffected: true },
  { x: 150, y: 58, isAffected: false },
  { x: 60, y: 132, isAffected: false },
  { x: 148, y: 128, isAffected: true },
  { x: 196, y: 98, isAffected: false },
  { x: 204, y: 40, isAffected: false },
  { x: 250, y: 74, isAffected: false },
  { x: 236, y: 140, isAffected: false },
  { x: 282, y: 116, isAffected: false },
  { x: 108, y: 160, isAffected: false },
] as const;

/** Pairs of node indices in contact. */
const EDGES = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 4],
  [2, 5],
  [3, 6],
  [3, 7],
  [5, 6],
  [5, 11],
  [4, 11],
  [6, 8],
  [7, 8],
  [6, 9],
  [8, 10],
  [9, 10],
] as const;

/** How far apart, in seconds, the nodes appear. */
const NODE_STAGGER = 0.07;
const RADIUS = { affected: 8, susceptible: 6 } as const;

/** Mathematics: the contact networks the research modelled spread across. */
export function SceneComplexNetwork() {
  return (
    <SceneFrame finding='A contact network in which a state spreads from agent to agent along their contacts: the complex-network and contagion models the research was built on.'>
      <g
        className='scene-in-fade'
        style={enterAfter(0.4)}
        stroke='var(--line-strong)'
        strokeWidth='1.4'
      >
        {EDGES.map(([from, to]) => {
          const a = NODES[from];
          const b = NODES[to];
          if (!a || !b) return null;
          const isSpreading = a.isAffected && b.isAffected;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isSpreading ? 'var(--signal-cyan)' : undefined}
              strokeWidth={isSpreading ? 2.2 : undefined}
            />
          );
        })}
      </g>

      {NODES.map((node, index) => (
        <circle
          key={`${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r={node.isAffected ? RADIUS.affected : RADIUS.susceptible}
          fill={node.isAffected ? 'var(--signal)' : 'var(--surface)'}
          stroke={node.isAffected ? 'var(--signal-cyan)' : 'var(--ink-faint)'}
          strokeWidth='1.6'
          className='scene-in-pop'
          style={enterAfter(index * NODE_STAGGER)}
        />
      ))}

      <text
        x='160'
        y='188'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        dI/dt = βSI − γI
      </text>
    </SceneFrame>
  );
}
