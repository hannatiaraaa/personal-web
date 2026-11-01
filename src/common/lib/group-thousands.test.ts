import { describe, expect, test } from 'bun:test';
import { groupThousands } from './group-thousands';

describe('groupThousands', () => {
  test('leaves a number under a thousand as it is', () => {
    expect(groupThousands(0)).toBe('0');
    expect(groupThousands(999)).toBe('999');
  });

  test('groups thousands with a comma, the way the site prints figures', () => {
    expect(groupThousands(1040)).toBe('1,040');
    expect(groupThousands(100000)).toBe('100,000');
    expect(groupThousands(1234567)).toBe('1,234,567');
  });

  test('keeps the sign outside the groups', () => {
    expect(groupThousands(-100)).toBe('-100');
    expect(groupThousands(-1234)).toBe('-1,234');
  });
});
