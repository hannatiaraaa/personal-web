import { describe, expect, test } from 'bun:test';
import { buildDotGrid } from './story-dot-grid';

const SPEC = { columns: 4, rows: 3, pitch: 10, centerX: 50, centerY: 30, flaggedIndex: 5 } as const;

describe('buildDotGrid', () => {
  test('lays out one dot per cell', () => {
    expect(buildDotGrid(SPEC)).toHaveLength(12);
  });

  test('centres the grid on the given point', () => {
    const dots = buildDotGrid(SPEC);
    const xs = dots.map((dot) => dot.x);
    const ys = dots.map((dot) => dot.y);

    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBe(SPEC.centerX);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBe(SPEC.centerY);
  });

  test('fills row by row', () => {
    const dots = buildDotGrid(SPEC);

    expect(dots[1]?.y).toBe(dots[0]?.y);
    expect(dots[4]?.x).toBe(dots[0]?.x);
    expect(dots[4]?.y).toBe((dots[0]?.y ?? 0) + SPEC.pitch);
  });

  test('flags exactly the one index asked for', () => {
    const dots = buildDotGrid(SPEC);

    expect(dots.findIndex((dot) => dot.isFlagged)).toBe(SPEC.flaggedIndex);
    expect(dots.filter((dot) => dot.isFlagged)).toHaveLength(1);
  });
});
