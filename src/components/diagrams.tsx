import { DraftOwnershipDiagram } from './diagram-draft-ownership';
import { TaxLadderDiagram } from './diagram-tax-ladder';

export type DiagramKind = 'draft-ownership' | 'tax-ladder';

export function CaseStudyDiagram({ kind }: { kind: DiagramKind }) {
  return kind === 'draft-ownership' ? <DraftOwnershipDiagram /> : <TaxLadderDiagram />;
}
