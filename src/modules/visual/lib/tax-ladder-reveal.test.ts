import { describe, expect, test } from 'bun:test';
import {
  describeComparison,
  ladderBarFractions,
  receiptRevealStart,
  RECEIPT_REVEAL_WINDOWS,
  tweenValue,
} from './tax-ladder-reveal';
import { compareLadders, DEFAULT_LADDER_SETTINGS } from './tax-ladder';

describe('receiptRevealStart', () => {
  test('the first row of a receipt starts where its window starts', () => {
    expect(receiptRevealStart('before', 0, 12)).toBe(RECEIPT_REVEAL_WINDOWS.before.start);
    expect(receiptRevealStart('after', 0, 8)).toBe(RECEIPT_REVEAL_WINDOWS.after.start);
  });

  test('rows start in order and the last starts inside its window', () => {
    const starts = Array.from({ length: 12 }, (_, index) => receiptRevealStart('before', index, 12));

    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    expect(starts.at(-1)).toBeLessThan(RECEIPT_REVEAL_WINDOWS.before.end);
  });

  test('the after receipt prints only once the before receipt has finished', () => {
    const lastBefore = receiptRevealStart('before', 11, 12);

    expect(receiptRevealStart('after', 0, 8)).toBeGreaterThan(lastBefore);
  });

  test('a single-row receipt starts at its window start', () => {
    expect(receiptRevealStart('after', 0, 1)).toBe(RECEIPT_REVEAL_WINDOWS.after.start);
  });
});

describe('ladderBarFractions', () => {
  test('the correct total is its share of the larger one', () => {
    const comparison = compareLadders(DEFAULT_LADDER_SETTINGS);

    expect(ladderBarFractions(comparison).after).toBeCloseTo(comparison.after.total / comparison.before.total, 6);
  });

  test('equal totals fill the track, with nothing over', () => {
    const comparison = compareLadders({ ...DEFAULT_LADDER_SETTINGS, taxBasisPoints: 0 });

    expect(ladderBarFractions(comparison)).toEqual({ after: 1, over: 0 });
  });

  test('the overcharge is the rest of the track, from where the correct total ends', () => {
    const { after, over } = ladderBarFractions(compareLadders(DEFAULT_LADDER_SETTINGS));

    expect(after + over).toBeCloseTo(1, 9);
    expect(over).toBeGreaterThan(0);
  });
});

describe('tweenValue', () => {
  test('is the start at 0, the end at 1, and between in between', () => {
    expect(tweenValue(100, 300, 0)).toBe(100);
    expect(tweenValue(100, 300, 1)).toBe(300);
    const middle = tweenValue(100, 300, 0.5);
    expect(middle).toBeGreaterThan(100);
    expect(middle).toBeLessThan(300);
  });

  test('lands on whole minor units, so a counting figure never shows a fraction of a cent', () => {
    expect(Number.isInteger(tweenValue(0, 3031, 0.37))).toBe(true);
  });
});

describe('describeComparison', () => {
  test('states both totals and the gap in one sentence', () => {
    const text = describeComparison(compareLadders(DEFAULT_LADDER_SETTINGS));

    expect(text).toBe('Tax at every level: 855.24. One ladder: 824.93. Over by 30.31, +3.7%.');
  });

  test('says the totals agree when there is no gap', () => {
    const text = describeComparison(compareLadders({ ...DEFAULT_LADDER_SETTINGS, taxBasisPoints: 0 }));

    expect(text).toContain('The totals agree.');
  });
});
