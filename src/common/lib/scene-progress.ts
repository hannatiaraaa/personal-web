import { clampProgress, viewportProgress } from './scroll-progress';

/**
 * How a scene's progress is measured.
 * - `pinned`: a tall section whose sticky child holds still while the section
 *   scrolls past it. 0 when the section top reaches the viewport top, 1 when its
 *   bottom reaches the viewport bottom — exactly the stretch the child is pinned.
 * - `through`: an element in plain flow. 0 as it enters at the bottom, 1 as it
 *   leaves at the top.
 */
export type SceneMode = 'pinned' | 'through';

/** The two edges a scene is measured by, in viewport coordinates. A `DOMRect` fits. */
export type SceneRect = { readonly top: number; readonly height: number };

const PROGRESS_DECIMALS = 4;

/** A scene's progress, 0–1, for where its element sits in the viewport. */
export function sceneProgress(rect: SceneRect, viewportHeight: number, mode: SceneMode): number {
  if (mode === 'through') return clampProgress(viewportProgress(rect.top, rect.height, viewportHeight));

  // Nothing to pin through when the section is no taller than the viewport:
  // it is either not there yet or already there.
  const travel = rect.height - viewportHeight;
  if (travel <= 0) return rect.top <= 0 ? 1 : 0;
  return clampProgress(-rect.top / travel);
}

/**
 * Local 0–1 progress for one sub-range of a scene, so a beat can run from, say,
 * 0.2 to 0.5 of the scroll and rest either side of it. An empty or reversed
 * range is a step at `end`.
 */
export function segmentProgress(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0;
  return clampProgress((progress - start) / (end - start));
}

/**
 * Which beat a scene is on: the last whose start `progress` has reached.
 * `beats` are ascending start points; before the first one the scene is on
 * beat 0, and a scene without beats is always on beat 0.
 */
export function beatAt(progress: number, beats: readonly number[]): number {
  let current = 0;
  beats.forEach((start, index) => {
    if (progress >= start) current = index;
  });
  return current;
}

/** Progress as written to `--progress`: clamped, fixed precision. */
export function formatProgress(progress: number): string {
  return clampProgress(progress).toFixed(PROGRESS_DECIMALS);
}
