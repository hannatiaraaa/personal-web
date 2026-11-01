import { segmentProgress } from '@/common/lib/scene-progress';
import { clampProgress, easeProgress } from '@/common/lib/scroll-progress';

/**
 * How the hero pool answers the scene's progress: calm, a disturbance that
 * builds and then settles before the scene ends, so it is still when the reader
 * scrolls back to the top. Pure: progress in, uniform values out.
 */
export const SCROLL_RESPONSE = {
  /** A nudge of the wheel should not stir the water. */
  calmUntil: 0.04,
  /** Where the disturbance is strongest, as scene progress. */
  peakAt: 0.4,
  /** By here it has settled; the rest of the exit is calm. */
  settledBy: 0.9,
  /** Extra swell amplitude at the peak, on top of the swell's own. */
  swellBoost: 0.7,
  /** Radians the pool tips toward the reader by the end of the scene. */
  maxTilt: 0.22,
  /** Share of the gap to the target closed per frame; smooths a flicked wheel. */
  easing: 0.06,
} as const;

export type FlowFieldScroll = {
  /** 0 calm → 1 at the peak. Drives the chop and the colour energy. */
  readonly disturbance: number;
  /** Multiplier on the swell amplitude, 1 at rest. */
  readonly swellGain: number;
  /** Rotation about x, in radians. */
  readonly tilt: number;
};

/** Rises from the dead zone to the peak, then falls to calm by `settledBy`. */
function disturbanceAt(travel: number): number {
  const { calmUntil, peakAt, settledBy } = SCROLL_RESPONSE;
  if (travel <= calmUntil || travel >= settledBy) return 0;
  if (travel <= peakAt) return easeProgress((travel - calmUntil) / (peakAt - calmUntil), 'ease-in-out');
  return 1 - easeProgress((travel - peakAt) / (settledBy - peakAt), 'ease-in-out');
}

export function mapScrollToFlowField(travel: number): FlowFieldScroll {
  const t = clampProgress(travel);
  const disturbance = disturbanceAt(t);

  return {
    disturbance,
    swellGain: 1 + SCROLL_RESPONSE.swellBoost * disturbance,
    tilt: SCROLL_RESPONSE.maxTilt * easeProgress(t, 'ease-in-out'),
  };
}

/**
 * The home intro's pull-back: through the last slice of the scene the camera
 * draws away, so the close-up water resolves into the whole lattice. The
 * finished scene is the usual position, which reduced motion and no-script see.
 */
export const INTRO_PULLBACK = {
  /** Scene progress where the camera starts to draw back. */
  from: 0.72,
  /** Where it is back at its usual distance. */
  to: 1,
  /** Share of the usual distance the camera sits closer in, before it draws back. */
  closeIn: 0.24,
} as const;

/** Multiplier on the camera's distance from its target, for a scene progress. */
export function introCameraScale(progress: number): number {
  const { from, to, closeIn } = INTRO_PULLBACK;
  const travel = segmentProgress(progress, from, to);
  return 1 - closeIn * (1 - easeProgress(travel, 'ease-in-out'));
}

type Point3 = readonly [number, number, number];

/** A camera position moved along its line of sight: `scale` of its distance from `target`. */
export function pullCamera(position: Point3, target: Point3, scale: number): [number, number, number] {
  return [
    target[0] + (position[0] - target[0]) * scale,
    target[1] + (position[1] - target[1]) * scale,
    target[2] + (position[2] - target[2]) * scale,
  ];
}

/**
 * A scene's progress as its driver wrote it to `--progress`. Anything absent or
 * unreadable is the finished scene, matching the property's registered default.
 */
export function parseSceneProgress(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? clampProgress(parsed) : 1;
}

/** One frame of easing toward a target: closes `rate` of the remaining gap. */
export function approachValue(current: number, target: number, rate: number): number {
  return current + (target - current) * clampProgress(rate);
}
