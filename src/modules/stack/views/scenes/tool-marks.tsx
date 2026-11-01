import type { JSX, ReactNode } from 'react';
import type { ScenePoint } from '../../lib';

/**
 * Simplified marks for the tools the scenes name, each drawn from scratch on a
 * 24-unit grid centred on its origin and stroked in the current colour — a
 * likeness to recognise at a glance, not a copy of the logo. Decorative: the
 * label beside a mark, and the scene's description, say what it is.
 */
const MARKS = {
  react: (
    <>
      <circle
        r='2.2'
        className='stack-mark-fill'
      />
      <ellipse
        rx='11'
        ry='4.2'
      />
      <ellipse
        rx='11'
        ry='4.2'
        transform='rotate(60)'
      />
      <ellipse
        rx='11'
        ry='4.2'
        transform='rotate(120)'
      />
    </>
  ),
  next: (
    <>
      <circle r='11' />
      <path d='M-4.5 5.5V-5.5L6 8M4.5-5.5V2' />
    </>
  ),
  nest: (
    <>
      <path d='M-9 8V-3L-7-11-2-5H2L7-11 9-3V8Q0 12-9 8Z' />
      <path d='M-4.5 0.5h.01M4.5 0.5h.01M-1.5 4.5 0 5.5 1.5 4.5' />
    </>
  ),
  typescript: (
    <>
      <rect
        x='-11'
        y='-11'
        width='22'
        height='22'
        rx='3'
      />
      <text
        x='0'
        y='4.5'
        textAnchor='middle'
        className='stack-mark-text'
      >
        TS
      </text>
    </>
  ),
  database: (
    <>
      <ellipse
        cy='-7'
        rx='9'
        ry='3.2'
      />
      <path d='M-9-7V7A9 3.2 0 0 0 9 7V-7M-9 0A9 3.2 0 0 0 9 0' />
    </>
  ),
  watermelon: (
    <>
      <path d='M-11-4A11 11 0 0 0 11-4Z' />
      <path d='M-7.5-4A7.5 7.5 0 0 0 7.5-4' />
      <path d='M-3 0h.01M0 2.5h.01M3 0h.01' />
    </>
  ),
  tablet: (
    <>
      <rect
        x='-8'
        y='-11'
        width='16'
        height='22'
        rx='2.5'
      />
      <path d='M-2 7.5h4' />
    </>
  ),
  ota: (
    <>
      <path d='M-6 4H-7.5A4.5 4.5 0 0 1-8-5 6.5 6.5 0 0 1 4.5-6.5 4.5 4.5 0 0 1 7.5 4H6' />
      <path d='M0-2V10M-3.5 6.5 0 10 3.5 6.5' />
    </>
  ),
  owner: (
    <>
      <circle
        cy='-5'
        r='4.5'
      />
      <path d='M-9 10A9 7 0 0 1 9 10' />
    </>
  ),
  server: (
    <>
      <rect
        x='-10'
        y='-10'
        width='20'
        height='9'
        rx='2'
      />
      <rect
        x='-10'
        y='1'
        width='20'
        height='9'
        rx='2'
      />
      <path d='M-6-5.5h.01M-6 5.5h.01' />
    </>
  ),
  'pull-request': (
    <>
      <circle
        cx='-6'
        cy='-7'
        r='2.6'
      />
      <circle
        cx='-6'
        cy='7'
        r='2.6'
      />
      <circle
        cx='6'
        cy='7'
        r='2.6'
      />
      <path d='M-6-4.4V4.4M6 4.4V-3A3 3 0 0 0 3-6H-1M1.5-8.5-1-6 1.5-3.5' />
    </>
  ),
  review: (
    <>
      <path d='M-10-8H10V5H-2L-7 10V5H-10Z' />
      <path d='M-5-1.5-2 1.5 5-4.5' />
    </>
  ),
  gate: (
    <>
      <path d='M0-11 9-7.5V0C9 6 5 9.5 0 11-5 9.5-9 6-9 0V-7.5Z' />
      <path d='M-4 0-1 3 5-3' />
    </>
  ),
  release: (
    <>
      <path d='M-10-2V-10H-2L10 2 2 10Z' />
      <circle
        cx='-5.5'
        cy='-5.5'
        r='1.6'
      />
    </>
  ),
  document: (
    <>
      <path d='M-7-11H3L8-6V11H-7ZM3-11V-6H8' />
      <path d='M-4-1H5M-4 3H5M-4 7H2' />
    </>
  ),
  vessel: (
    <>
      <path d='M-11 2H11L7 9H-7Z' />
      <path d='M-6 2V-3H3V2M-1-3V-10' />
    </>
  ),
  dna: <path d='M-5-11C6-6 6 6-5 11M5-11C-6-6-6 6 5 11M-3-6H3M-4 0H4M-3 6H3' />,
  lock: (
    <>
      <rect
        x='-7'
        y='-2'
        width='14'
        height='11'
        rx='2'
      />
      <path d='M-4-2V-6A4 4 0 0 1 4-6V-2M0 2.5V5' />
    </>
  ),
  model: <path d='M-10-11V10H11M-7 6C-2 6-1-7 9-7' />,
  sap: (
    <>
      <path d='M-12-7H12L3 7H-12Z' />
      <path d='M-7-2H-3M-7 2H1' />
    </>
  ),
  claude: (
    <path d='M0-3.5V-11M0 3.5V11M-3.5 0H-11M3.5 0H11M2.5-2.5 7.8-7.8M-2.5 2.5-7.8 7.8M2.5 2.5 7.8 7.8M-2.5-2.5-7.8-7.8' />
  ),
  chatgpt: (
    <>
      <rect
        x='-4.5'
        y='-10'
        width='9'
        height='20'
        rx='4.5'
      />
      <rect
        x='-4.5'
        y='-10'
        width='9'
        height='20'
        rx='4.5'
        transform='rotate(60)'
      />
      <rect
        x='-4.5'
        y='-10'
        width='9'
        height='20'
        rx='4.5'
        transform='rotate(120)'
      />
    </>
  ),
  copilot: (
    <>
      <path d='M-10 4V0A10 9 0 0 1 10 0V4C10 9 5 11 0 11S-10 9-10 4Z' />
      <circle
        cx='-4'
        cy='0'
        r='3.2'
      />
      <circle
        cx='4'
        cy='0'
        r='3.2'
      />
      <path d='M-2 6.5h.01M2 6.5h.01' />
    </>
  ),
  antigravity: <path d='M-11 10C-11-3-6-11 0-11S11-3 11 10M-4.5 10C-4.5 3-2.5-2 0-2S4.5 3 4.5 10' />,
  python: (
    <>
      <rect
        x='-11'
        y='-11'
        width='13'
        height='13'
        rx='4'
      />
      <rect
        x='-2'
        y='-2'
        width='13'
        height='13'
        rx='4'
      />
      <path d='M-7-7h.01M7 7h.01' />
    </>
  ),
  r: (
    <>
      <ellipse
        rx='11'
        ry='7'
      />
      <text
        x='1'
        y='5'
        textAnchor='middle'
        className='stack-mark-text'
      >
        R
      </text>
    </>
  ),
  matlab: <path d='M-11 6-3 2 1-10 5 0 11 4 0 11ZM-3 2 0 11M5 0 0 11' />,
  maple: <path d='M0-11 2-5 6-7 5-2 10-1 6 3 7 7 2 5 0 8-2 5-7 7-6 3-10-1-5-2-6-7-2-5ZM0 8V12' />,
  mathematica: <path d='M0-11 3-4 10-6 5 0 10 6 3 4 0 11-3 4-10 6-5 0-10-6-3-4Z' />,
  redux: (
    <path d='M-3 9.5A10 10 0 0 1-9.5-4M-1.5-10A10 10 0 0 1 9.5 1M8 6.5A10 10 0 0 1-6 8M-9.5-4h.01M9.5 1h.01M-6 8h.01' />
  ),
  saga: <path d='M7-8C1-12-9-8-6-2S7 3 6 8-4 12-8 8' />,
  drizzle: <path d='M0-11C5-4 8 0 8 4A8 8 0 0 1-8 4C-8 0-5-4 0-11Z' />,
  globe: (
    <>
      <circle r='10' />
      <ellipse
        rx='4.2'
        ry='10'
      />
      <path d='M-10 0H10' />
    </>
  ),
  mdx: (
    <>
      <rect
        x='-12'
        y='-7'
        width='24'
        height='14'
        rx='2'
      />
      <text
        x='0'
        y='3'
        textAnchor='middle'
        className='stack-mark-text stack-mark-text-small'
      >
        MDX
      </text>
    </>
  ),
  three: <path d='M-10 9H10L0-10ZM0 9 5-0.5H-5Z' />,
  gsap: (
    <text
      x='0'
      y='3.5'
      textAnchor='middle'
      className='stack-mark-text stack-mark-text-small'
    >
      GSAP
    </text>
  ),
  firebase: <path d='M-7 9-4-10 0-3 3-8 7 9 0 12Z' />,
  figma: (
    <>
      <circle
        cx='-3.5'
        cy='-7'
        r='3.5'
      />
      <circle
        cx='3.5'
        cy='-7'
        r='3.5'
      />
      <circle
        cx='-3.5'
        cy='0'
        r='3.5'
      />
      <circle
        cx='3.5'
        cy='0'
        r='3.5'
      />
      <circle
        cx='-3.5'
        cy='7'
        r='3.5'
      />
    </>
  ),
} satisfies Record<string, JSX.Element>;

export type ToolMarkName = keyof typeof MARKS;

type Props = {
  name: ToolMarkName;
  at: ScenePoint;
  /** Drawn at this multiple of the 24-unit grid. */
  scale?: number;
  /** The mark of the node the scene is about wears the signal colour. */
  accent?: boolean;
};

export function ToolMark({ name, at, scale = 1, accent = false }: Props): ReactNode {
  return (
    <g
      aria-hidden='true'
      className={accent ? 'stack-mark stack-mark-accent' : 'stack-mark'}
      transform={`translate(${at.x} ${at.y}) scale(${scale})`}
    >
      {MARKS[name]}
    </g>
  );
}
