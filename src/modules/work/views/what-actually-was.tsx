import type { CaseStudy } from '@/content/case-studies';
import { CaseStudyDiagram } from '@/modules/visual/components/diagrams';
import { CaseStudyInteractive, INTERACTIVE_PLACEMENT } from '@/modules/visual/components/interactives';
import { CaseStudyPart } from '@/modules/work/components/case-study-part';

/**
 * The divergence, the mechanism drawn where one is worth drawing, and an
 * interactive where one exists — either in the diagram's place at the column's
 * full width, or after it as a piece to try.
 */
export function WhatActuallyWas({ study }: { study: CaseStudy }) {
  const diagram = study.diagram && <CaseStudyDiagram kind={study.diagram} />;
  const placement = study.interactive && INTERACTIVE_PLACEMENT[study.interactive];
  const interactive = study.interactive && (
    <CaseStudyInteractive
      kind={study.interactive}
      study={study}
      fallback={diagram}
    />
  );

  return (
    <CaseStudyPart
      part='actually'
      wide={placement === 'replaces-diagram' ? interactive : undefined}
    >
      {study.actually.map((paragraph, index) => (
        // Index, not a prefix of the prose: two paragraphs can open with the
        // same words, and a duplicate key mis-reconciles the list.
        <p key={index}>{paragraph}</p>
      ))}
      {placement !== 'replaces-diagram' && diagram}
      {placement === 'after-diagram' && interactive}
    </CaseStudyPart>
  );
}
