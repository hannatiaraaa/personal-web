import { describe, expect, test } from 'bun:test';
import {
  APPROVAL_LADDERS,
  DEFAULT_APPROVAL_REQUEST,
  formatApprovalAmount,
  HARD_CODED_APPROVER,
  routeApproval,
  type ApprovalLadder,
  type ApprovalRequest,
} from './approval-ladder';

/** One approver for everything: the rule the first customer had, now written down as configuration. */
const ONE_APPROVER: ApprovalLadder = {
  customer: 'a',
  priceCheck: null,
  tiers: [{ role: 'superintendent', limit: null }],
  guard: null,
  superApprover: 'director',
};

/** A hierarchy: a price check, two tiers of spending authority, and a guard above the budget owner. */
const HIERARCHY: ApprovalLadder = {
  customer: 'b',
  priceCheck: 'purchasing',
  tiers: [
    { role: 'superintendent', limit: 5_000 },
    { role: 'finance', limit: 25_000 },
  ],
  guard: 'director',
  superApprover: 'director',
};

function request(overrides: Partial<ApprovalRequest> = {}): ApprovalRequest {
  return { amount: 1_000, needsPriceCheck: false, isOverridden: false, ...overrides };
}

describe('routeApproval, configured', () => {
  test('a request within the first tier is approved by that tier alone', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 5_000 }), 'configured');

    expect(route.approvers).toEqual(['superintendent']);
    expect(route.outcome).toEqual({ kind: 'approved' });
  });

  test('a request over a tier climbs to the next, in order', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 5_001 }), 'configured');

    expect(route.approvers).toEqual(['superintendent', 'finance']);
  });

  test('above the budget owner’s limit the guard must sign as well', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 25_001 }), 'configured');

    expect(route.approvers).toEqual(['superintendent', 'finance', 'director']);
    expect(route.rungs.find((rung) => rung.reason === 'guard')?.status).toBe('required');
  });

  test('a request that needs a price check goes to purchasing before anyone approves', () => {
    const route = routeApproval(HIERARCHY, request({ needsPriceCheck: true }), 'configured');

    expect(route.approvers).toEqual(['purchasing', 'superintendent']);
  });

  test('a customer with no price check configured is not sent to one', () => {
    const route = routeApproval(ONE_APPROVER, request({ needsPriceCheck: true, amount: 30_000 }), 'configured');

    expect(route.approvers).toEqual(['superintendent']);
  });

  test('every configured rung is drawn, and the ones this request does not need are skipped', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 1_000 }), 'configured');

    expect(route.rungs.map((rung) => [rung.role, rung.reason, rung.status])).toEqual([
      ['purchasing', 'price-check', 'skipped'],
      ['superintendent', 'authority', 'required'],
      ['finance', 'authority', 'skipped'],
      ['director', 'guard', 'skipped'],
    ]);
  });

  test('a rung carries its approver’s spending limit', () => {
    const route = routeApproval(HIERARCHY, request(), 'configured');

    expect(route.rungs.filter((rung) => rung.reason === 'authority').map((rung) => rung.limit)).toEqual([
      5_000, 25_000,
    ]);
  });

  test('over every limit with no guard configured, nobody has the authority', () => {
    const capped: ApprovalLadder = { ...HIERARCHY, guard: null };

    const route = routeApproval(capped, request({ amount: 30_000 }), 'configured');

    expect(route.outcome).toEqual({ kind: 'no-authority' });
  });
});

describe('routeApproval, super-approver override', () => {
  test('the ladder is bypassed, and every step it skipped is still shown as bypassed', () => {
    const route = routeApproval(
      HIERARCHY,
      request({ amount: 12_000, needsPriceCheck: true, isOverridden: true }),
      'configured',
    );

    expect(route.approvers).toEqual(['director']);
    expect(route.outcome).toEqual({
      kind: 'bypassed',
      by: 'director',
      skipped: ['purchasing', 'superintendent', 'finance'],
    });
    expect(route.rungs.filter((rung) => rung.status === 'bypassed').map((rung) => rung.role)).toEqual([
      'purchasing',
      'superintendent',
      'finance',
    ]);
    expect(route.rungs.at(-1)).toMatchObject({ role: 'director', reason: 'override', status: 'required' });
  });

  test('above the guard’s line, the super-approver is not listed as skipping themselves', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 30_000, isOverridden: true }), 'configured');

    expect(route.approvers).toEqual(['director']);
    expect(route.outcome).toEqual({ kind: 'bypassed', by: 'director', skipped: ['superintendent', 'finance'] });
    expect(route.rungs.filter((rung) => rung.status === 'bypassed').map((rung) => rung.role)).toEqual([
      'superintendent',
      'finance',
    ]);
  });

  test('without a super-approver configured, an override changes nothing', () => {
    const noOverride: ApprovalLadder = { ...HIERARCHY, superApprover: null };

    const route = routeApproval(noOverride, request({ isOverridden: true }), 'configured');

    expect(route.approvers).toEqual(['superintendent']);
    expect(route.outcome).toEqual({ kind: 'approved' });
  });
});

describe('routeApproval, hard-coded', () => {
  test('every request goes to the one approver in the code, whatever the amount', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 30_000, needsPriceCheck: true }), 'hard-coded');

    expect(route.approvers).toEqual([HARD_CODED_APPROVER]);
  });

  test('for the customer the code was written for, the outcome is right', () => {
    const route = routeApproval(ONE_APPROVER, request({ amount: 30_000 }), 'hard-coded');

    expect(route.outcome).toEqual({ kind: 'approved' });
  });

  test('for a hierarchy, the approvers its rule needs are missed', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 12_000, needsPriceCheck: true }), 'hard-coded');

    expect(route.outcome).toEqual({ kind: 'wrong', missing: ['purchasing', 'finance'], unexpected: [] });
    expect(route.rungs.filter((rung) => rung.status === 'missed').map((rung) => rung.role)).toEqual([
      'purchasing',
      'finance',
    ]);
  });

  test('a small request with no price check looks right, which is why the bug read as intermittent', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 2_000 }), 'hard-coded');

    expect(route.outcome).toEqual({ kind: 'approved' });
  });

  test('the code knows nothing of an override, so it is ignored', () => {
    const route = routeApproval(HIERARCHY, request({ amount: 2_000, isOverridden: true }), 'hard-coded');

    expect(route.approvers).toEqual([HARD_CODED_APPROVER]);
    expect(route.rungs.some((rung) => rung.status === 'bypassed')).toBe(false);
  });

  test('a ladder without the hard-coded approver gets them anyway, as unexpected', () => {
    const elsewhere: ApprovalLadder = { ...ONE_APPROVER, tiers: [{ role: 'finance', limit: null }] };

    const route = routeApproval(elsewhere, request(), 'hard-coded');

    expect(route.rungs[0]).toMatchObject({ role: HARD_CODED_APPROVER, reason: 'hard-coded', status: 'required' });
    expect(route.outcome).toEqual({ kind: 'wrong', missing: ['finance'], unexpected: [HARD_CODED_APPROVER] });
  });
});

describe('the illustrative customers', () => {
  test('two customers, two different ladders: the same request routes differently with no code change', () => {
    const [first, second] = APPROVAL_LADDERS;
    if (!first || !second) throw new Error('two customers expected');

    const a = routeApproval(first, DEFAULT_APPROVAL_REQUEST, 'configured');
    const b = routeApproval(second, DEFAULT_APPROVAL_REQUEST, 'configured');

    expect(a.approvers).not.toEqual(b.approvers);
    expect(a.outcome.kind).toBe('approved');
    expect(b.outcome.kind).toBe('approved');
  });

  test('hard-coded, the opening request is wrong for the second customer only', () => {
    const [first, second] = APPROVAL_LADDERS;
    if (!first || !second) throw new Error('two customers expected');

    expect(routeApproval(first, DEFAULT_APPROVAL_REQUEST, 'hard-coded').outcome.kind).toBe('approved');
    expect(routeApproval(second, DEFAULT_APPROVAL_REQUEST, 'hard-coded').outcome.kind).toBe('wrong');
  });
});

describe('formatApprovalAmount', () => {
  test('groups thousands and has no decimals', () => {
    expect(formatApprovalAmount(12_500)).toBe('12,500');
    expect(formatApprovalAmount(0)).toBe('0');
  });
});
