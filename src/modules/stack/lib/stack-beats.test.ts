import { describe, expect, test } from 'bun:test';
import { buildStackBeats, formatGroupIndex, stackTravelSvh } from './stack-beats';

const LAYOUT = { stepSvh: 60, leadSvh: 20, readingLineSvh: 65, tailSvh: 15 } as const;

describe('stackTravelSvh', () => {
  test('is the steps column, less the screen it is read in', () => {
    // 20 lead + 3 × 60 steps + (35 + 15) below, less one screen of 100.
    expect(stackTravelSvh(3, LAYOUT)).toBe(150);
  });
});

describe('buildStackBeats', () => {
  test('starts each group’s beat as its step’s top crosses the reading line', () => {
    const beats = buildStackBeats(3, LAYOUT);

    // Group 1's top is 80 down the column and reaches the line 65 down the
    // screen after 15 of 150; group 2's after 75.
    expect(beats[1]).toBeCloseTo(15 / 150, 6);
    expect(beats[2]).toBeCloseTo(75 / 150, 6);
  });

  test('puts the first group on from the start, while it is still arriving', () => {
    expect(buildStackBeats(3, LAYOUT)[0]).toBe(0);
  });

  test('has one beat per group, the last held to the end of the scene', () => {
    expect(buildStackBeats(3, LAYOUT)).toHaveLength(3);
  });

  test('is strictly ascending, as ScrollScene requires', () => {
    const beats = buildStackBeats(6, LAYOUT);

    beats.slice(1).forEach((start, index) => expect(start).toBeGreaterThan(beats[index] ?? Infinity));
  });

  test('has no beats when there are no groups', () => {
    expect(buildStackBeats(0, LAYOUT)).toEqual([]);
  });
});

describe('formatGroupIndex', () => {
  test('pads the position and the count to two digits', () => {
    expect(formatGroupIndex(3, 6)).toBe('03 / 06');
  });

  test('keeps wider numbers whole', () => {
    expect(formatGroupIndex(12, 120)).toBe('12 / 120');
  });
});
