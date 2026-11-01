import { describe, expect, test } from 'bun:test';
import { caseStudies } from '@/content/case-studies';
import { figures, headlineFigures } from '@/content/facts';
import { isCountable, parseFigure, type FigureParts } from './figure-parts';
import { groupThousands } from './group-thousands';

describe('parseFigure', () => {
  test('splits a figure with a trailing qualifier', () => {
    expect(parseFigure('100+')).toEqual({ prefix: '', integer: 100, suffix: '+', isGrouped: false });
  });

  test('reads a thousands separator as part of the number', () => {
    expect(parseFigure('1,000+')).toEqual({ prefix: '', integer: 1000, suffix: '+', isGrouped: true });
  });

  test('keeps a unit as the suffix, space included', () => {
    expect(parseFigure('6 years')).toEqual({ prefix: '', integer: 6, suffix: ' years', isGrouped: false });
  });

  test('keeps a leading qualifier as the prefix', () => {
    expect(parseFigure('< 4 weeks')).toEqual({ prefix: '< ', integer: 4, suffix: ' weeks', isGrouped: false });
    expect(parseFigure('~1,100')).toEqual({ prefix: '~', integer: 1100, suffix: '', isGrouped: true });
  });

  test('parses a bare integer', () => {
    expect(parseFigure('3')).toEqual({ prefix: '', integer: 3, suffix: '', isGrouped: false });
  });

  test('returns null when there is no integer to count to', () => {
    expect(parseFigure('multiple')).toBeNull();
    expect(parseFigure('')).toBeNull();
  });

  test('returns null for two integers, which a single counter cannot tell', () => {
    expect(parseFigure('2015–2019')).toBeNull();
    expect(parseFigure('6 years, 5 remote')).toBeNull();
  });

  test('returns null for a decimal rather than counting to the wrong number', () => {
    expect(parseFigure('1.5x')).toBeNull();
    expect(parseFigure('0.5')).toBeNull();
  });

  test('returns null for a malformed separator rather than guessing', () => {
    expect(parseFigure('1,00')).toBeNull();
  });
});

/** The figure written back from its parts, separator only where the original had one. */
function writeBack(parts: FigureParts): string {
  const integer = parts.isGrouped ? groupThousands(parts.integer) : String(parts.integer);
  return `${parts.prefix}${integer}${parts.suffix}`;
}

describe('every published figure', () => {
  const published = [
    ...headlineFigures.map((figure) => figure.value),
    ...Object.values(figures),
    ...caseStudies.flatMap((study) => study.evidence.map((figure) => figure.value)),
  ];

  test('either parses and formats back to exactly the published string, or has no digits', () => {
    for (const value of published) {
      const parts = parseFigure(value);

      if (parts === null) {
        // Static on purpose: a word ("multiple", "two") has nothing to count.
        expect(value).not.toMatch(/\d/);
      } else {
        expect(writeBack(parts)).toBe(value);
      }
    }
  });
});

describe('isCountable', () => {
  test('counts a figure below a thousand', () => {
    expect(isCountable({ prefix: '', integer: 100, suffix: '+', isGrouped: false })).toBe(true);
  });

  test('does not count a grouped figure, which a CSS counter would print without its comma', () => {
    expect(isCountable({ prefix: '', integer: 1000, suffix: '+', isGrouped: true })).toBe(false);
    expect(isCountable({ prefix: '~', integer: 1100, suffix: '', isGrouped: true })).toBe(false);
  });

  test('does not count an ungrouped figure of a thousand or more either', () => {
    expect(isCountable({ prefix: '', integer: 2026, suffix: '', isGrouped: false })).toBe(false);
  });

  test('does not count a single digit, whose only in-between values are wrong figures', () => {
    expect(isCountable({ prefix: '', integer: 2, suffix: ' weeks', isGrouped: false })).toBe(false);
    expect(isCountable({ prefix: '< ', integer: 4, suffix: ' weeks', isGrouped: false })).toBe(false);
    expect(isCountable({ prefix: '', integer: 10, suffix: '+', isGrouped: false })).toBe(true);
  });
});
