import { slugify } from '@/common/lib/slug';

/** The four parts every case study is told in, in reading order. */
const CASE_STUDY_PART_ORDER = ['reported', 'actually', 'shipped', 'evidence'] as const;

export type CaseStudyPartKey = (typeof CASE_STUDY_PART_ORDER)[number];

type PartLabels = {
  /** The part's heading on the page. */
  readonly legend: string;
  /** The same part in the part indicator, where a narrow bar has room for one word. */
  readonly short: string;
};

const PART_LABELS: Record<CaseStudyPartKey, PartLabels> = {
  reported: { legend: 'How it was reported', short: 'Reported' },
  actually: { legend: 'What it actually was', short: 'Actually' },
  shipped: { legend: 'What shipped', short: 'Shipped' },
  evidence: { legend: 'Evidence', short: 'Evidence' },
};

export type CaseStudyPartInfo = PartLabels & {
  readonly key: CaseStudyPartKey;
  /** Id of the part's heading — the target its indicator link jumps to. */
  readonly id: string;
  /** Position in reading order; the part's `data-step`. */
  readonly step: number;
};

/** Everything the page and the indicator need to agree on for one part. */
export function describeCaseStudyPart(key: CaseStudyPartKey): CaseStudyPartInfo {
  const labels = PART_LABELS[key];
  return { key, ...labels, id: slugify(labels.legend), step: CASE_STUDY_PART_ORDER.indexOf(key) };
}

/** All four parts, in reading order. */
export function listCaseStudyParts(): readonly CaseStudyPartInfo[] {
  return CASE_STUDY_PART_ORDER.map(describeCaseStudyPart);
}
