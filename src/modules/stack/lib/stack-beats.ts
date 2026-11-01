import { formatPosition } from '@/common/lib/format-position';

/**
 * How the pinned skills story is laid out, in `svh`: the steps column is padded
 * by `leadSvh` above the first group and, below the last, by the rest of the
 * screen under the reading line plus `tailSvh`; each group's step is `stepSvh`
 * tall. Everything in one unit, so the beats hold on any screen.
 */
export type StackStoryLayout = {
  readonly stepSvh: number;
  readonly leadSvh: number;
  /** A group takes over the panel as its step's top crosses this line, measured from the top of the screen. */
  readonly readingLineSvh: number;
  /** How long the last group holds once its step has passed the line. */
  readonly tailSvh: number;
};

const SCREEN_SVH = 100;

/** How far the scene scrolls while pinned: the steps column, less the screen it is read in. */
export function stackTravelSvh(groupCount: number, layout: StackStoryLayout): number {
  const below = SCREEN_SVH - layout.readingLineSvh + layout.tailSvh;
  return layout.leadSvh + groupCount * layout.stepSvh + below - SCREEN_SVH;
}

/**
 * Where each beat starts, as scene progress: one per group, as its step crosses
 * the reading line; the first is on from the start. The same sum runs the
 * other way in stack-story.css, where `--stack-at` is derived from `--progress`.
 */
export function buildStackBeats(groupCount: number, layout: StackStoryLayout): number[] {
  const travel = stackTravelSvh(groupCount, layout);
  return Array.from({ length: groupCount }, (_, index) => {
    if (index === 0 || travel <= 0) return 0;
    const crossing = layout.leadSvh + index * layout.stepSvh - layout.readingLineSvh;
    return Math.min(Math.max(crossing / travel, 0), 1);
  });
}

/** `03 / 06`: a group's place in the library, for orientation. */
export function formatGroupIndex(position: number, count: number): string {
  return `${formatPosition(position - 1)} / ${formatPosition(count - 1)}`;
}
