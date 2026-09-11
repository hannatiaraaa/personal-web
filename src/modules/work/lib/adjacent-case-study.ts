import { caseStudies, type CaseStudy } from '@/content/case-studies';

/**
 * The case study to offer after this one, or `null` when there is nothing to
 * offer.
 *
 * Two guards, both for states the content can reach. A single case study has no
 * next one — wrapping would link the page to itself. And an unknown slug gives
 * `findIndex` a `-1`, which wrapping would quietly turn into the first entry,
 * pointing "Next" somewhere unrelated instead of showing nothing.
 */
export function nextCaseStudy(slug: string, studies: readonly CaseStudy[] = caseStudies): CaseStudy | null {
  if (studies.length < 2) return null;

  const index = studies.findIndex((study) => study.slug === slug);
  if (index < 0) return null;

  return studies[(index + 1) % studies.length] ?? null;
}
