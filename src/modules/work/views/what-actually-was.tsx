import type { CaseStudy } from '@/content/case-studies';
import { CaseStudyDiagram } from '@/modules/visual/components/diagrams';
import { CaseStudyPart } from '@/modules/work/components/case-study-part';

/** The divergence, and the mechanism drawn where one is worth drawing. */
export function WhatActuallyWas({ study }: { study: CaseStudy }) {
  return (
    <CaseStudyPart legend='What it actually was'>
      {study.actually.map((paragraph, index) => (
        // Index, not a prefix of the prose: two paragraphs can open with the
        // same words, and a duplicate key mis-reconciles the list.
        <p key={index}>{paragraph}</p>
      ))}
      {study.diagram && <CaseStudyDiagram kind={study.diagram} />}
    </CaseStudyPart>
  );
}
