import { SceneFrame, enterAfter, sceneLabel } from './scene-frame';

/**
 * Two strands of a helix around x = 44, crossing every 40 units down; each
 * half-turn bows out to ±18 and back. Rungs join them where they are apart.
 */
const STRAND_A = 'M44 24 C68 34 68 54 44 64 C20 74 20 94 44 104 C68 114 68 134 44 144 C20 154 20 174 44 184';
const STRAND_B = 'M44 24 C20 34 20 54 44 64 C68 74 68 94 44 104 C20 114 20 134 44 144 C68 154 68 174 44 184';
const RUNGS = [
  { y: 36, half: 14 },
  { y: 44, half: 18 },
  { y: 52, half: 14 },
  { y: 76, half: 14 },
  { y: 84, half: 18 },
  { y: 92, half: 14 },
  { y: 116, half: 14 },
  { y: 124, half: 18 },
  { y: 132, half: 14 },
  { y: 156, half: 14 },
  { y: 164, half: 18 },
  { y: 172, half: 14 },
] as const;

/**
 * Rows of ciphertext. Illustrative bytes, not real output. Two groups, so the
 * rows keep room at the right edge where the mono face sets wider.
 */
const CIPHER_ROWS = ['9f3a 07c1', '5d02 bb7e', 'c86a 4e13', '27e5 a90c'] as const;
const ROW_STAGGER = 0.15;

/** Nalagenetics: genetic results kept unreadable at rest by a client-side library. */
export function SceneEncryptedAtRest() {
  return (
    <SceneFrame finding='A patient’s genetic results passing through a client-side encryption library: what rests on the device is ciphertext, unreadable without the key.'>
      <g
        strokeWidth='2'
        strokeLinecap='round'
      >
        {RUNGS.map((rung) => (
          <line
            key={rung.y}
            x1={44 - rung.half}
            x2={44 + rung.half}
            y1={rung.y}
            y2={rung.y}
            stroke='var(--line-strong)'
            strokeWidth='1.4'
          />
        ))}
        <path
          d={STRAND_A}
          stroke='var(--signal)'
        />
        <path
          d={STRAND_B}
          stroke='var(--signal-cyan)'
        />
      </g>

      <path
        d='M80 100 H118 M110 93 L118 100 L110 107'
        stroke='var(--ink-faint)'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='scene-in-fade'
        style={enterAfter(0.2)}
      />

      {/* The library: a lock. */}
      <g
        className='scene-in-pop'
        style={enterAfter(0.4)}
      >
        <rect
          x='126'
          y='68'
          width='64'
          height='64'
          rx='12'
          fill='var(--signal-wash)'
          stroke='var(--signal)'
          strokeWidth='1.6'
        />
        <path
          d='M146 98 V90 a12 12 0 0 1 24 0 V98'
          stroke='var(--signal)'
          strokeWidth='2.4'
          strokeLinecap='round'
        />
        <rect
          x='141'
          y='97'
          width='34'
          height='24'
          rx='4'
          fill='var(--signal)'
        />
        <circle
          cx='158'
          cy='108'
          r='3'
          fill='var(--surface)'
        />
      </g>

      <path
        d='M198 100 H214 M206 93 L214 100 L206 107'
        stroke='var(--ink-faint)'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='scene-in-fade'
        style={enterAfter(0.6)}
      />

      <g>
        {CIPHER_ROWS.map((row, index) => (
          <text
            key={row}
            x='220'
            y={74 + index * 20}
            className={`${sceneLabel} scene-in-slide`}
            style={enterAfter(0.7 + index * ROW_STAGGER)}
            fill='var(--ink-muted)'
          >
            {row}
          </text>
        ))}
      </g>

      <text
        x='158'
        y='160'
        textAnchor='middle'
        className={sceneLabel}
        fill='var(--signal)'
      >
        encrypted at rest
      </text>
    </SceneFrame>
  );
}
