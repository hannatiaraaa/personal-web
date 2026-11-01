/**
 * The clock of a scene that plays by itself where it cannot pin: progress runs
 * evenly from `from` to 1 over `durationMs`, and a stepped piece reads its step
 * off that progress, each step an equal share.
 */
export type AutoRunSpan = {
  /** Where the run starts, as scene progress (0–1). */
  readonly from: number;
  readonly durationMs: number;
};

const END = 1;

export function autoRunProgress(elapsedMs: number, span: AutoRunSpan): number {
  if (span.durationMs <= 0) return END;
  const share = Math.min(Math.max(elapsedMs / span.durationMs, 0), 1);
  return share >= 1 ? END : span.from + (END - span.from) * share;
}

/** The step on screen at `progress` of a run of `stepCount` steps; the last holds at the end. */
export function autoRunStep(progress: number, stepCount: number): number {
  const last = Math.max(stepCount - 1, 0);
  return Math.min(Math.max(Math.floor(progress * stepCount), 0), last);
}
