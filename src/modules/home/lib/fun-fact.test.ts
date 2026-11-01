import { describe, expect, test } from 'bun:test';
import { nextFactIndex } from './fun-fact';

describe('nextFactIndex', () => {
  test('moves on to the next fact', () => {
    expect(nextFactIndex(0, 4)).toBe(1);
  });

  test('comes back round to the first after the last', () => {
    expect(nextFactIndex(3, 4)).toBe(0);
  });

  test('stays on the only fact when there is one', () => {
    expect(nextFactIndex(0, 1)).toBe(0);
  });

  test('has only the first slot to offer when there are no facts', () => {
    expect(nextFactIndex(2, 0)).toBe(0);
  });
});
