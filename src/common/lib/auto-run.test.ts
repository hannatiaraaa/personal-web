import { describe, expect, test } from 'bun:test';
import { autoRunProgress, autoRunStep } from './auto-run';

describe('autoRunProgress', () => {
  const run = { from: 0, durationMs: 1000 };

  test('starts where the run starts', () => {
    expect(autoRunProgress(0, run)).toBe(0);
    expect(autoRunProgress(0, { from: 0.46, durationMs: 1000 })).toBe(0.46);
  });

  test('moves evenly from its start to the end over its duration', () => {
    expect(autoRunProgress(500, run)).toBeCloseTo(0.5);
    expect(autoRunProgress(500, { from: 0.5, durationMs: 1000 })).toBeCloseTo(0.75);
  });

  test('rests at the end once the duration has passed', () => {
    expect(autoRunProgress(1000, run)).toBe(1);
    expect(autoRunProgress(5000, run)).toBe(1);
  });

  test('never runs backwards, and a run with no duration is already over', () => {
    expect(autoRunProgress(-20, run)).toBe(0);
    expect(autoRunProgress(0, { from: 0, durationMs: 0 })).toBe(1);
  });
});

describe('autoRunStep', () => {
  test('gives each step an equal share of the run', () => {
    expect(autoRunStep(0, 6)).toBe(0);
    expect(autoRunStep(0.17, 6)).toBe(1);
    expect(autoRunStep(0.5, 6)).toBe(3);
    expect(autoRunStep(0.84, 6)).toBe(5);
  });

  test('holds the last step at the end, and clamps outside the run', () => {
    expect(autoRunStep(1, 6)).toBe(5);
    expect(autoRunStep(1.4, 6)).toBe(5);
    expect(autoRunStep(-1, 6)).toBe(0);
  });

  test('a single step is always that step', () => {
    expect(autoRunStep(0.5, 1)).toBe(0);
  });
});
