import type { CaseStudy } from '@/content/case-studies';
import { ApprovalStill } from './story-still-approval';
import { DraftSyncStill } from './story-still-draft-sync';
import { GateStill } from './story-still-gate';
import { TaxLadderStill } from './story-still-tax-ladder';

/**
 * A study's drawing in the home story. A study with an interactive is drawn as
 * the frame its piece ends on; one without is drawn from its `still`. A new
 * kind on either side is a compile error here until it has a drawing.
 */
export function StoryStill({ study }: { study: CaseStudy }) {
  switch (study.interactive) {
    case 'draft-sync':
      return <DraftSyncStill />;
    case 'tax-ladder-playground':
      return <TaxLadderStill />;
    case 'release-gate-run':
      return <GateStill />;
    case 'approval-engine':
      return <ApprovalStill />;
    case undefined:
      break;
  }

  switch (study.still) {
    case 'approval-ladder':
      return <ApprovalStill />;
    case undefined:
      return null;
  }
}
