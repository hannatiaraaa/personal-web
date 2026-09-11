import { DraftOwnershipDiagram } from './diagram-draft-ownership';
import { TaxLadderDiagram } from './diagram-tax-ladder';

/** The diagrams a case study may carry. Imported by the content type, so a new
 *  kind is a compile error here until it is drawn. */
export type DiagramKind = 'draft-ownership' | 'tax-ladder';

export function CaseStudyDiagram({ kind }: { kind: DiagramKind }) {
  switch (kind) {
    case 'draft-ownership':
      return <DraftOwnershipDiagram />;
    case 'tax-ladder':
      return <TaxLadderDiagram />;
  }
}
