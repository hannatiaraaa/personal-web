import { caseStudies, type CaseStudy } from '@/content/case-studies';

/**
 * The case study to offer after this one, or `null`: a single study must not
 * link to itself, and an unknown slug (`findIndex` → -1) must not wrap to the first.
 */
export function nextCaseStudy(slug: string, studies: readonly CaseStudy[] = caseStudies): CaseStudy | null {
  if (studies.length < 2) return null;

  const index = studies.findIndex((study) => study.slug === slug);
  if (index < 0) return null;

  return studies[(index + 1) % studies.length] ?? null;
}
