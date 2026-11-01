import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/** Three repositories, side by side, each starting from its first commit. */
const REPOS = [40, 130, 220] as const;
const REPO = { width: 64, height: 116, top: 36 } as const;
/** Commits down each repository's history; the first is the initial one. */
const COMMIT_ROWS = [62, 88, 114, 140] as const;
const COMMIT_STAGGER = 0.18;
const REPO_STAGGER = 0.12;

/** Joining Altonaut: the first codebases, initialised. */
export function SceneFirstCodebases() {
  return (
    <SceneFrame finding='Three empty repositories getting their first commits: joining in the product’s first months, as the frontend engineer who initialised the codebases.'>
      {REPOS.map((x, repoIndex) => {
        const centre = x + REPO.width / 2;
        return (
          <g key={x}>
            <rect
              x={x}
              y={REPO.top}
              width={REPO.width}
              height={REPO.height}
              rx='8'
              fill='var(--surface-sunk)'
              stroke='var(--line-strong)'
              strokeWidth='1.2'
            />
            <path
              d={`M${centre} ${COMMIT_ROWS[0]} V${COMMIT_ROWS[COMMIT_ROWS.length - 1]}`}
              stroke='var(--signal-cyan)'
              strokeWidth='2'
              className='scene-in-fade'
              style={enterAfter(0.3 + repoIndex * REPO_STAGGER)}
            />
            {COMMIT_ROWS.map((y, commitIndex) => (
              <circle
                key={y}
                cx={centre}
                cy={y}
                r={commitIndex === 0 ? 7 : 5}
                fill={commitIndex === 0 ? 'var(--signal)' : 'var(--surface)'}
                stroke='var(--signal)'
                strokeWidth='1.6'
                className='scene-in-pop'
                style={enterAfter(repoIndex * REPO_STAGGER + commitIndex * COMMIT_STAGGER)}
              />
            ))}
          </g>
        );
      })}

      <text
        x='160'
        y='24'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        git init
      </text>
      <text
        x='160'
        y='182'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        first commits
      </text>
    </SceneFrame>
  );
}
