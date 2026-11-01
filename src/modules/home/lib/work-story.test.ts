import { describe, expect, test } from 'bun:test';
import { pickStoryStudies, storyAction } from './work-story';

const STUDIES = [
  { slug: 'runs-in-page', interactive: 'draft-sync' },
  { slug: 'prose-only' },
  { slug: 'drawn', still: 'approval-ladder' },
  { slug: 'also-runs', interactive: 'release-gate-run' },
] as const;

describe('pickStoryStudies', () => {
  test('keeps every study with something to draw, in content order', () => {
    expect(pickStoryStudies(STUDIES).map((study) => study.slug)).toEqual(['runs-in-page', 'drawn', 'also-runs']);
  });

  test('leaves out a study with neither an interactive nor a still', () => {
    expect(pickStoryStudies(STUDIES).some((study) => study.slug === 'prose-only')).toBe(false);
  });

  test('has nothing to tell when no study is drawn', () => {
    expect(pickStoryStudies([{ slug: 'prose-only' }])).toEqual([]);
  });
});

describe('storyAction', () => {
  test('opens a study with an interactive at the part the piece is drawn in', () => {
    expect(storyAction({ slug: 'runs-in-page', interactive: 'draft-sync' })).toEqual({
      kind: 'try',
      interactive: 'draft-sync',
      href: '/work/runs-in-page#what-it-actually-was',
    });
  });

  test('sends a study without one to the top of its case study', () => {
    expect(storyAction({ slug: 'drawn', still: 'approval-ladder' })).toEqual({ kind: 'read', href: '/work/drawn' });
  });
});
