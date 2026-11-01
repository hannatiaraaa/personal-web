import type { CSSProperties, ReactNode } from 'react';

/*
 * The shared frame for the home story's stills: one viewBox for every drawing,
 * and the stagger each animated part reads. Decorative (the step carries the
 * words), so hidden from assistive tech; motion is in scrolly-home.css off `--on`.
 */

const STILL_WIDTH = 240;
const STILL_HEIGHT = 150;

/** Inputs to a still part's entrance: its place in the stagger. */
type StillPartStyle = CSSProperties & Record<'--i', number>;

/** The style that puts a part `order`-th in its still's entrance. */
export function at(order: number): StillPartStyle {
  return { '--i': order };
}

export function StillSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${STILL_WIDTH} ${STILL_HEIGHT}`}
      aria-hidden='true'
      className='block h-full w-full'
    >
      {children}
    </svg>
  );
}
