import { describe, expect, test } from 'bun:test';
import { clampProgress, easeProgress, viewportProgress } from './scroll-progress';

describe('clampProgress', () => {
  test('passes a value already between 0 and 1 through unchanged', () => {
    expect(clampProgress(0.25)).toBe(0.25);
  });

  test('holds a value before the start at 0 and past the end at 1', () => {
    expect(clampProgress(-0.4)).toBe(0);
    expect(clampProgress(1.7)).toBe(1);
  });

  test('treats a value that is not a number as the start, not as NaN downstream', () => {
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe('easeProgress', () => {
  test('every curve starts at 0 and lands exactly on 1', () => {
    for (const curve of ['linear', 'ease-in-out', 'ease-out'] as const) {
      expect(easeProgress(0, curve)).toBe(0);
      expect(easeProgress(1, curve)).toBe(1);
    }
  });

  test('linear is the identity', () => {
    expect(easeProgress(0.3, 'linear')).toBeCloseTo(0.3);
  });

  test('ease-in-out is symmetric about the midpoint', () => {
    expect(easeProgress(0.5, 'ease-in-out')).toBeCloseTo(0.5);
    expect(easeProgress(0.2, 'ease-in-out') + easeProgress(0.8, 'ease-in-out')).toBeCloseTo(1);
  });

  test('ease-in-out starts slower than linear', () => {
    expect(easeProgress(0.2, 'ease-in-out')).toBeLessThan(0.2);
  });

  test('ease-out runs ahead of linear, so motion settles rather than stops', () => {
    expect(easeProgress(0.2, 'ease-out')).toBeGreaterThan(0.2);
    expect(easeProgress(0.8, 'ease-out')).toBeGreaterThan(0.8);
  });

  test('never moves backwards as progress increases', () => {
    for (const curve of ['linear', 'ease-in-out', 'ease-out'] as const) {
      let previous = -1;
      for (let step = 0; step <= 20; step += 1) {
        const value = easeProgress(step / 20, curve);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    }
  });

  test('clamps out-of-range progress before easing it', () => {
    expect(easeProgress(-1, 'ease-out')).toBe(0);
    expect(easeProgress(2, 'ease-in-out')).toBe(1);
  });
});

describe('viewportProgress', () => {
  test('is 0 as the element enters at the bottom of the viewport', () => {
    expect(viewportProgress(800, 400, 800)).toBe(0);
  });

  test('is 1 as the element leaves at the top', () => {
    expect(viewportProgress(-400, 400, 800)).toBe(1);
  });

  test('is one half when the element is centred', () => {
    expect(viewportProgress(200, 400, 800)).toBe(0.5);
  });

  test('runs past the ends rather than clamping, so a caller can tell before from after', () => {
    expect(viewportProgress(1000, 400, 800)).toBeLessThan(0);
    expect(viewportProgress(-600, 400, 800)).toBeGreaterThan(1);
  });

  test('is 0 for a viewport with no height, rather than dividing by zero', () => {
    expect(viewportProgress(0, 0, 0)).toBe(0);
  });
});
