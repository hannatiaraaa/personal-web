import type { ReactNode } from 'react';
import type { CaseStudy } from '@/content/case-studies';
import { ApprovalEngineInteractive } from './approval-engine-interactive';
import { DraftSyncInteractive } from './draft-sync-interactive';
import { ReleaseGateRun } from './release-gate-run';
import { TaxLadderScene } from './tax-ladder-scene';

/** The interactives a case study may carry. Imported by the content type, so a
 *  new kind is a compile error here until it is built. */
export type InteractiveKind = 'draft-sync' | 'release-gate-run' | 'tax-ladder-playground' | 'approval-engine';

/**
 * Where each interactive sits. A model of the mechanism itself replaces the
 * diagram at the column's full width, with the diagram as its fallback; a
 * piece to try comes after the diagram, inside the prose column.
 */
export const INTERACTIVE_PLACEMENT: Readonly<Record<InteractiveKind, 'replaces-diagram' | 'after-diagram'>> = {
  'draft-sync': 'replaces-diagram',
  'release-gate-run': 'after-diagram',
  'tax-ladder-playground': 'after-diagram',
  // No diagram to come after: the board is the drawing, and two ladders side by side want the full width.
  'approval-engine': 'replaces-diagram',
};

type Props = {
  kind: InteractiveKind;
  study: CaseStudy;
  /** The static diagram, for a reader the interactive cannot reach. */
  fallback?: ReactNode;
};

export function CaseStudyInteractive({ kind, study, fallback }: Props) {
  switch (kind) {
    case 'draft-sync':
      return (
        <DraftSyncInteractive
          reported={study.reported}
          fallback={fallback}
        />
      );
    case 'release-gate-run':
      return <ReleaseGateRun />;
    case 'tax-ladder-playground':
      return <TaxLadderScene />;
    case 'approval-engine':
      return <ApprovalEngineInteractive reported={study.reported} />;
  }
}
