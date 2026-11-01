import { SceneFrame, sceneLabel } from './scene-frame';

/**
 * Signal arcs around the shore mast at (30, 76), each spanning ±45°. The
 * outermost ends well short of the vessel — that gap is the scene.
 */
const SIGNAL_ARCS = [
  'M45.6 60.4 A22 22 0 0 1 45.6 91.6',
  'M61.1 44.9 A44 44 0 0 1 61.1 107.1',
  'M76.7 29.3 A66 66 0 0 1 76.7 122.7',
] as const;

const SEA =
  'M0 150 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0';

/** 2024: the app went to sea, where there is no connection at all. */
export function SceneOutOfSignal() {
  return (
    <SceneFrame finding='A vessel past the reach of the shore signal: at sea there is no connection at all, so working offline is the premise of the app rather than a feature of it.'>
      {/* Shore and mast */}
      <path
        d='M0 150 H54 L64 200 H0 Z'
        fill='var(--surface-sunk)'
        stroke='var(--line-strong)'
      />
      <path
        d='M22 150 L30 80 L38 150 M24.5 128 H35.5 M27 106 H33'
        stroke='var(--ink-faint)'
        strokeWidth='1.4'
        strokeLinejoin='round'
      />
      <circle
        cx='30'
        cy='76'
        r='3'
        fill='var(--signal)'
      />
      <g
        stroke='var(--signal-cyan)'
        strokeWidth='1.8'
        strokeLinecap='round'
      >
        {SIGNAL_ARCS.map((d) => (
          <path
            key={d}
            d={d}
            className='scene-signal'
          />
        ))}
      </g>

      {/* Edge of range */}
      <line
        x1='112'
        x2='112'
        y1='30'
        y2='146'
        stroke='var(--line-strong)'
        strokeDasharray='3 4'
      />

      {/* Sea */}
      <path
        d={SEA}
        stroke='var(--sky-mid)'
        strokeWidth='1.4'
      />

      {/* Vessel, with a crossed-out signal above it */}
      <g className='scene-vessel'>
        <g className='scene-vessel-bob'>
          <path
            d='M190 132 H272 L262 148 H202 Z'
            fill='var(--surface)'
            stroke='var(--ink-muted)'
            strokeWidth='1.4'
            strokeLinejoin='round'
          />
          <rect
            x='212'
            y='112'
            width='30'
            height='20'
            rx='2'
            fill='var(--surface-sunk)'
            stroke='var(--ink-muted)'
            strokeWidth='1.4'
          />
          <path
            d='M252 132 V100'
            stroke='var(--ink-muted)'
            strokeWidth='1.4'
          />
          <g
            stroke='var(--ink-faint)'
            strokeWidth='2'
            strokeLinecap='round'
          >
            <path d='M222 92 V86' />
            <path d='M229 92 V80' />
            <path d='M236 92 V74' />
          </g>
          <path
            d='M216 72 L242 96'
            stroke='var(--signal)'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </g>
      </g>

      <text
        x='30'
        y='186'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        shore
      </text>
      <text
        x='231'
        y='176'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        no connection
      </text>
    </SceneFrame>
  );
}
