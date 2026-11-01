import type { CSSProperties, ReactNode } from 'react';

/** Labels inside a scene: small monospace, in the scene's own units. */
export const sceneLabel = 'font-mono text-[11px]';

type DelayStyle = CSSProperties & Record<'--d', string>;

/**
 * When a shape's entrance starts, for the shared `scene-in-*` classes in
 * scrolly-about.css. Only the scene being read plays it; every other scene
 * rests in its finished state.
 */
export function enterAfter(seconds: number): DelayStyle {
  return { '--d': `${seconds}s` };
}

type Props = {
  /** What the era found, not what the shapes are. */
  finding: string;
  children: ReactNode;
};

/**
 * Shared frame for the arc's scenes. Each scene is drawn from scratch in theme
 * tokens; its static markup is its final state — what the era ended with — and
 * any motion only plays toward it, in CSS, while the scene is the one being
 * read (scrolly-about.css).
 */
export function SceneFrame({ finding, children }: Props) {
  return (
    <svg
      viewBox='0 0 320 200'
      role='img'
      aria-label={finding}
      className='era-scene block h-full w-full'
      fill='none'
    >
      {children}
    </svg>
  );
}
