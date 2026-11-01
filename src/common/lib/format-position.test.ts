import { describe, expect, test } from 'bun:test';
import { formatPosition } from './format-position';

describe('formatPosition', () => {
  test('counts from one, in two digits', () => {
    expect(formatPosition(0)).toBe('01');
    expect(formatPosition(9)).toBe('10');
  });

  test('keeps a wider number whole', () => {
    expect(formatPosition(119)).toBe('120');
  });
});
