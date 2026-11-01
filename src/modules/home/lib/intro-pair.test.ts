import { describe, expect, test } from 'bun:test';
import { pickIntroPair } from './intro-pair';

const STUDIES = [
  { slug: 'first', title: 'What the first was', reported: 'First report.', context: 'Module one' },
  { slug: 'second', title: 'What the second was', reported: 'Second report.', context: 'Module two' },
] as const;

describe('pickIntroPair', () => {
  test('pairs the chosen study’s reported sentence with its title, as what it was', () => {
    expect(pickIntroPair(STUDIES, 'second')).toEqual({
      slug: 'second',
      reported: 'Second report.',
      actually: 'What the second was',
      context: 'Module two',
    });
  });

  test('falls back to the first study when the chosen one has been renamed away', () => {
    expect(pickIntroPair(STUDIES, 'gone')?.slug).toBe('first');
  });

  test('has no pair to show when there are no studies', () => {
    expect(pickIntroPair([], 'first')).toBeUndefined();
  });
});
