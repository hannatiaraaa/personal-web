import { describe, expect, test } from 'bun:test';
import type { CaseStudy } from '@/content/case-studies';
import { nextCaseStudy } from './adjacent-case-study';

function study(slug: string): CaseStudy {
  return {
    slug,
    title: slug,
    context: '',
    period: '',
    summary: '',
    reported: '',
    actually: [],
    shipped: [],
    evidence: [],
    stack: [],
  };
}

const three = [study('a'), study('b'), study('c')];

describe('nextCaseStudy', () => {
  test('offers the following study', () => {
    expect(nextCaseStudy('a', three)?.slug).toBe('b');
    expect(nextCaseStudy('b', three)?.slug).toBe('c');
  });

  test('wraps from the last back to the first', () => {
    expect(nextCaseStudy('c', three)?.slug).toBe('a');
  });

  test('offers nothing when there is only one study, rather than itself', () => {
    expect(nextCaseStudy('a', [study('a')])).toBeNull();
  });

  test('offers nothing for an unknown slug, rather than the first study', () => {
    // findIndex returns -1; wrapping it would have pointed "Next" at 'a'.
    expect(nextCaseStudy('nope', three)).toBeNull();
  });

  test('offers nothing when there are no studies at all', () => {
    expect(nextCaseStudy('a', [])).toBeNull();
  });
});
