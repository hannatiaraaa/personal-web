import type { CaseStudy } from '@/content/case-studies';

/** The one divergence the home page opens on: what was said, and what it was. */
export type IntroPair = {
  readonly slug: string;
  readonly reported: string;
  /** The study's title, which names the mechanism the report pointed away from. */
  readonly actually: string;
  readonly context: string;
};

type PairSource = Pick<CaseStudy, 'slug' | 'title' | 'reported' | 'context'>;

/**
 * The pair for the study named by `slug`, or the first study's when that one
 * has been renamed or removed — the opening should never go blank over a slug.
 */
export function pickIntroPair(studies: readonly PairSource[], slug: string): IntroPair | undefined {
  const study = studies.find((candidate) => candidate.slug === slug) ?? studies[0];
  if (!study) return undefined;

  return { slug: study.slug, reported: study.reported, actually: study.title, context: study.context };
}
