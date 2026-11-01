import type { InteractiveKind } from '@/modules/visual/components/interactives';

/**
 * The call to action on each step of the home story. A study with an
 * interactive invites the one thing its piece lets a reader do; the rest are
 * read. Which is which is read from the study's `interactive` field.
 */
export const tryIt = {
  prefix: 'Try it',
  action: {
    'draft-sync': 'Replay the bug',
    'tax-ladder-playground': 'Move the tax rate',
    'release-gate-run': 'Run the gate',
    'approval-engine': 'Route a requisition',
  },
  read: 'Read the case study',
} as const satisfies {
  prefix: string;
  action: Record<InteractiveKind, string>;
  read: string;
};
