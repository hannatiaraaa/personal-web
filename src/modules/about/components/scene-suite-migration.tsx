import { figures } from '@/content/facts';
import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/** Files in flight between the two apps, staggered so they read as a stream. */
const FILES = [
  { x: 84, y: 72 },
  { x: 108, y: 96 },
  { x: 92, y: 120 },
  { x: 120, y: 64 },
  { x: 134, y: 112 },
] as const;
const FILE_STAGGER = 0.14;

/** Two people on the same record in the back office. */
const CURSORS = [
  { x: 218, y: 92 },
  { x: 262, y: 116 },
] as const;

/** The procurement suite moved out of React Native Web into the back office. */
export function SceneSuiteMigration() {
  return (
    <SceneFrame
      finding={`The procurement suite moving, ${figures.migrationFiles} files across web and API, out of the React Native Web app and into the back-office web app, where several people work the same records at once.`}
    >
      {/* React Native Web app */}
      <rect
        x='20'
        y='46'
        width='52'
        height='100'
        rx='10'
        fill='var(--surface-sunk)'
        stroke='var(--line-strong)'
        strokeWidth='1.4'
      />
      <g
        stroke='var(--ink-faint)'
        strokeWidth='3'
        strokeLinecap='round'
      >
        <path d='M30 70 H58' />
        <path d='M30 84 H52' />
        <path d='M30 98 H60' />
      </g>

      {FILES.map((file, index) => (
        <g
          key={`${file.x}-${file.y}`}
          className='scene-in-slide'
          style={enterAfter(index * FILE_STAGGER)}
        >
          <path
            d={`M${file.x} ${file.y} h12 l5 5 v15 h-17 Z`}
            fill='var(--signal-wash)'
            stroke='var(--signal)'
            strokeWidth='1.2'
            strokeLinejoin='round'
          />
        </g>
      ))}

      {/* Back-office web app */}
      <g
        className='scene-in-pop'
        style={enterAfter(0.6)}
      >
        <rect
          x='166'
          y='36'
          width='136'
          height='120'
          rx='10'
          fill='var(--surface)'
          stroke='var(--signal)'
          strokeWidth='1.6'
        />
        <path
          d='M166 54 H302'
          stroke='var(--line-strong)'
        />
        <rect
          x='178'
          y='66'
          width='112'
          height='16'
          rx='3'
          fill='var(--surface-sunk)'
        />
        <rect
          x='178'
          y='88'
          width='112'
          height='16'
          rx='3'
          fill='var(--signal-wash)'
          stroke='var(--signal-cyan)'
        />
        <rect
          x='178'
          y='110'
          width='112'
          height='16'
          rx='3'
          fill='var(--surface-sunk)'
        />
        {CURSORS.map((cursor) => (
          <path
            key={cursor.x}
            d={`M${cursor.x} ${cursor.y} l0 14 l4 -4 l5 7 l3 -2 l-5 -6 l6 0 Z`}
            fill='var(--signal)'
            stroke='var(--surface)'
            strokeWidth='1'
            strokeLinejoin='round'
          />
        ))}
      </g>

      <text
        x='46'
        y='168'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--ink-muted)'
      >
        rn web
      </text>
      <text
        x='234'
        y='176'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        back office
      </text>
    </SceneFrame>
  );
}
