/** Named easing curves. A union, so a typo is a compile error rather than a linear fallback. */
export type ProgressCurve = 'linear' | 'ease-in-out' | 'ease-out';

const HALF = 0.5;

/** Progress held to 0–1. Anything that is not a number reads as the start. */
export function clampProgress(raw: number): number {
  if (Number.isNaN(raw)) return 0;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Maps clamped progress through a curve. Cubic throughout: strong enough to be
 * felt on a scroll that a reader controls, gentle enough not to lurch.
 */
export function easeProgress(progress: number, curve: ProgressCurve): number {
  const p = clampProgress(progress);

  switch (curve) {
    case 'linear':
      return p;
    case 'ease-out':
      return 1 - (1 - p) ** 3;
    case 'ease-in-out':
      return p < HALF ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
  }
}

/**
 * How far an element has travelled through the viewport: 0 as its top edge
 * enters at the bottom, 1 as its bottom edge leaves at the top. Unclamped, so a
 * caller can tell "not yet" from "already gone".
 */
export function viewportProgress(top: number, height: number, viewportHeight: number): number {
  const travel = viewportHeight + height;
  if (travel <= 0) return 0;
  return (viewportHeight - top) / travel;
}
