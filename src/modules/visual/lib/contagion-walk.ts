import { DEFAULT_PARAMS } from './contagion';

/** The beta slider on the contagion figure. The walk only lands on its notches. */
export const BETA_SLIDER = {
  min: 0.005,
  max: 0.12,
  step: 0.005,
  initial: DEFAULT_PARAMS.beta,
} as const;

/** What one step of the guided walk sets on the model. */
export type WalkParams = {
  readonly beta: number;
  readonly running: boolean;
};

const WALK_START: WalkParams = { beta: 0.01, running: true };

/**
 * The guided walk beside the contagion figure, one entry per step: a low
 * beta, a high one, then the published beta again for the relapse term. In
 * the model, beta mostly sets how fast it spreads; relapse is what keeps it
 * from burning out, so the last step shows the model as it was written.
 */
export const CONTAGION_WALK: readonly WalkParams[] = [
  WALK_START,
  { beta: 0.08, running: true },
  { beta: DEFAULT_PARAMS.beta, running: true },
];

const FIRST = 0;

/**
 * The model parameters for a step of the walk. Before the first step, or for
 * an index that is not a whole number, the earlier step holds; past the last,
 * the last one does — the walk never invents a step it does not have.
 */
export function contagionWalkAt(step: number): WalkParams {
  const last = CONTAGION_WALK.length - 1;
  const index = Number.isNaN(step) ? FIRST : Math.min(Math.max(Math.floor(step), FIRST), last);
  return CONTAGION_WALK[index] ?? WALK_START;
}
