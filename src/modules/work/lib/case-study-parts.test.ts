import { describe, expect, test } from 'bun:test';
import { describeCaseStudyPart, listCaseStudyParts } from './case-study-parts';

describe('case study parts', () => {
  test('lists the four parts in reading order, each step its position', () => {
    const parts = listCaseStudyParts();

    expect(parts.map((part) => part.key)).toEqual(['reported', 'actually', 'shipped', 'evidence']);
    expect(parts.map((part) => part.step)).toEqual([0, 1, 2, 3]);
  });

  test('keeps the heading ids the page already links and labels by', () => {
    const ids = listCaseStudyParts().map((part) => part.id);

    expect(ids).toEqual(['how-it-was-reported', 'what-it-actually-was', 'what-shipped', 'evidence']);
  });

  test('gives every part an id no other part shares', () => {
    const ids = listCaseStudyParts().map((part) => part.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test('describes one part the same way the list does', () => {
    expect(describeCaseStudyPart('shipped')).toEqual({
      key: 'shipped',
      legend: 'What shipped',
      short: 'Shipped',
      id: 'what-shipped',
      step: 2,
    });
  });
});
