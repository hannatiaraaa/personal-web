/** Where one step of a scroll story sits, in viewport pixels. */
export type StepBounds = {
  readonly index: number;
  readonly top: number;
  readonly bottom: number;
};

/** The horizontal strip of the viewport a reader's eye rests on, in viewport pixels. */
export type ReadingBand = {
  readonly top: number;
  readonly bottom: number;
};

function overlap(step: StepBounds, band: ReadingBand): number {
  return Math.min(step.bottom, band.bottom) - Math.max(step.top, band.top);
}

/**
 * The step a reader is on: the one covering most of the reading band.
 *
 * An even split goes to the later step, so scrolling down advances as soon as
 * the next step has as much claim as the current one. When no step is in the
 * band — the gap between two steps, or before the first — the previous answer
 * stands, so the visual does not flicker back to a default between steps.
 */
export function pickActiveStep(steps: readonly StepBounds[], band: ReadingBand, previous: number): number {
  let active = previous;
  let best = 0;

  for (const step of steps) {
    const covered = overlap(step, band);
    if (covered <= 0) continue;
    const isLater = step.index > active;
    if (covered > best || (covered === best && isLater)) {
      active = step.index;
      best = covered;
    }
  }

  return active;
}

/**
 * The reading band as fractions of viewport height: a strip just above the
 * middle, where the eye settles when reading down a page — not the centre
 * line, which a short step can cross without ever being read.
 */
const READING_BAND_TOP = 0.4;
const READING_BAND_BOTTOM = 0.55;

const PERCENT = 100;

/** The reading band in viewport pixels for a viewport of the given height. */
export function readingBandAt(viewportHeight: number): ReadingBand {
  return { top: viewportHeight * READING_BAND_TOP, bottom: viewportHeight * READING_BAND_BOTTOM };
}

/**
 * The same band as an `IntersectionObserver` root margin: the viewport shrunk
 * from above and below until only the band is left, so the observer fires
 * exactly when a step crosses into or out of it.
 */
export function readingBandRootMargin(): string {
  const top = Math.round(READING_BAND_TOP * PERCENT);
  const bottom = Math.round((1 - READING_BAND_BOTTOM) * PERCENT);
  return `-${top}% 0px -${bottom}% 0px`;
}
