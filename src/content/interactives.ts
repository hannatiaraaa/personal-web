import { listNames } from '@/common/lib/list-names';
import type { SyncPolicy } from '@/modules/visual/lib/draft-sync';

/**
 * Copy for the case studies' interactives: what each picture says to a screen
 * reader, and the sentences around the drawing. Every number in them is the
 * model's, counted where it is used — none is a published figure, and each
 * piece labels itself illustrative on screen.
 */

export const draftSyncCopy = {
  /** The drawing's description, per policy: the finding, not the shapes. */
  description: {
    'last-write-wins':
      'Illustrative simulation without draft ownership. Tablet A goes offline holding a draft of version 1 while tablet B moves the work order on and completes it at version 3. When A reconnects, its stale draft is applied on top as version 4: the completed job reopens and the record reverts, with no error anywhere.',
    'draft-ownership':
      'Illustrative simulation with draft ownership. Tablet A goes offline holding a draft of version 1 while tablet B moves the work order on and completes it at version 3. When A reconnects, the late-draft guard rejects its draft because the job has already completed, and the record stays completed at version 3.',
  },
  outcome: {
    reverted: {
      legend: 'Reported',
      note: "Tablet A's stale draft landed on the completed job. Nothing errored — the record reverted.",
    },
    rejected: {
      legend: 'With the late-draft guard',
      headline: 'Rejected — job already completed.',
      note: 'A draft that arrives after its job completed describes a state that no longer exists. The record stays.',
    },
  },
} as const satisfies {
  description: Record<SyncPolicy, string>;
  outcome: {
    reverted: { legend: string; note: string };
    rejected: { legend: string; headline: string; note: string };
  };
};

export const releaseGateRunCopy = {
  label: 'Release gate run, illustrative',
  debtListLabel: 'Quarantined debt, illustrative names',
  /** One per beat, in order. */
  captions: [
    {
      kicker: 'Reported',
      headline: '“All tests are green — we should be fine to release.”',
      line: 'A small suite, every case passing. Green because it was not looking.',
    },
    {
      kicker: 'The gate',
      headline: 'Repeatable cases, run spec by spec',
      line: 'Disposable schemas, synthetic fixtures, a snapshot restored per case.',
    },
    {
      kicker: 'Known debt',
      headline: 'Inherited gaps, quarantined by name',
      line: 'Listed on every run, never counted as a pass — so a new regression shows the day it lands.',
    },
    {
      kicker: 'Permissions',
      headline: 'Every profile against every guarded route',
      line: 'Allow or deny, decided before the handler runs, checked on every run.',
    },
    {
      kicker: 'Certified',
      headline: 'Release certified without customer data',
      line: 'Old debt cannot pass. A new regression cannot hide in it.',
    },
  ],
  /** The picture's description, given how many inherited gaps the model draws. */
  describe: (debtCount: number) =>
    `Illustrative release-gate run. A small suite reported all green. The real gate runs its cases spec by spec on disposable schemas with synthetic data; ${debtCount} inherited gaps are quarantined by name and never counted as passes; every profile is checked against every guarded route; the release is certified.`,
} as const;

export const approvalEngineCopy = {
  label: 'Try it: one requisition through two customers’ approval rules',
  policyLabel: 'Approval rules',
  policy: {
    'hard-coded': 'Hard-coded approver',
    configured: 'Configured by the customer',
  },
  amountLabel: 'Requisition amount',
  priceCheckLabel: 'Needs a price check',
  overrideLabel: 'Super-approver override',
  requester: { name: 'Requester', line: 'Raises the requisition' },
  customer: {
    a: { name: 'Customer A', rule: 'One approver' },
    b: { name: 'Customer B', rule: 'A hierarchy' },
  },
  role: {
    superintendent: 'Superintendent',
    purchasing: 'Purchasing',
    finance: 'Finance',
    director: 'Director',
  },
  /** What a rung is for. `limit` arrives formatted, or `null` for any amount. */
  reason: {
    'price-check': () => 'Mandatory price check',
    authority: (limit: string | null) => (limit === null ? 'Any amount' : `Spending authority up to ${limit}`),
    guard: () => 'Guard above the budget owner’s limit',
    override: () => 'Super-approver, signing alone',
    'hard-coded': () => 'The one approver in the code',
  },
  status: {
    required: 'Signs',
    skipped: 'Not needed',
    bypassed: 'Bypassed',
    missed: 'Never asked',
  },
  /** The headline under each customer's ladder. `reported` is the case study's own sentence. */
  headline: {
    approved: { configured: 'Routed by this customer’s own ladder.', 'hard-coded': 'Right for this request.' },
    bypassed: 'Ladder bypassed by the super-approver — and the screen says so.',
    'no-authority': 'No one on this ladder has the authority for this amount.',
  },
  detail: {
    signedBy: (roles: readonly string[]) => `Signed by ${listNames(roles)}.`,
    neverAsked: (roles: readonly string[]) => `Never asked: ${listNames(roles)}.`,
    askedInstead: (roles: readonly string[]) => `Asked instead: ${listNames(roles)}.`,
    skipped: (roles: readonly string[]) => `Skipped: ${listNames(roles)}.`,
  },
  note: {
    'hard-coded': 'One approver in the code. A third customer would be another branch.',
    configured: 'Two customers, two ladders — and no code change between them.',
  },
} as const;
