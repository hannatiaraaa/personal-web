import { describe, expect, test } from 'bun:test';
import { listNames } from './list-names';

describe('listNames', () => {
  test('nothing to list is an empty string', () => {
    expect(listNames([])).toBe('');
  });

  test('one name stands alone, two are joined by "and"', () => {
    expect(listNames(['Finance'])).toBe('Finance');
    expect(listNames(['Purchasing', 'Finance'])).toBe('Purchasing and Finance');
  });

  test('three or more take commas, with "and" before the last and no serial comma', () => {
    expect(listNames(['Purchasing', 'Superintendent', 'Finance'])).toBe('Purchasing, Superintendent and Finance');
  });
});
