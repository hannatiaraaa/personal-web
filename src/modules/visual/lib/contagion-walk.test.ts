import { describe, expect, test } from 'bun:test';
import { DEFAULT_PARAMS } from './contagion';
import { BETA_SLIDER, CONTAGION_WALK, contagionWalkAt } from './contagion-walk';

describe('contagionWalkAt', () => {
  test('starts the walk at a low beta, with the model running', () => {
    const first = contagionWalkAt(0);

    expect(first.beta).toBeLessThan(DEFAULT_PARAMS.beta);
    expect(first.running).toBe(true);
  });

  test('raises beta on the second step', () => {
    expect(contagionWalkAt(1).beta).toBeGreaterThan(contagionWalkAt(0).beta);
  });

  test('returns to the published beta for the relapse term, so the step shows the model as it was written', () => {
    expect(contagionWalkAt(2).beta).toBe(DEFAULT_PARAMS.beta);
  });

  test('holds the last step past the end of the walk', () => {
    expect(contagionWalkAt(CONTAGION_WALK.length + 3)).toEqual(contagionWalkAt(CONTAGION_WALK.length - 1));
  });

  test('holds the first step before the walk and for a step that is not a whole number', () => {
    expect(contagionWalkAt(-1)).toEqual(contagionWalkAt(0));
    expect(contagionWalkAt(Number.NaN)).toEqual(contagionWalkAt(0));
    expect(contagionWalkAt(1.6)).toEqual(contagionWalkAt(1));
  });

  test('keeps the model running at every step, so the walk never leaves it paused', () => {
    for (const step of CONTAGION_WALK) expect(step.running).toBe(true);
  });

  test('puts every beta on a position the slider can reach, so the readout matches a value a visitor could pick', () => {
    for (const { beta } of CONTAGION_WALK) {
      expect(beta).toBeGreaterThanOrEqual(BETA_SLIDER.min);
      expect(beta).toBeLessThanOrEqual(BETA_SLIDER.max);
      const notches = (beta - BETA_SLIDER.min) / BETA_SLIDER.step;
      expect(Math.abs(notches - Math.round(notches))).toBeLessThan(1e-9);
    }
  });

  test('starts the slider at the published beta', () => {
    expect(BETA_SLIDER.initial).toBe(DEFAULT_PARAMS.beta);
  });
});
