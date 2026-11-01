import { describe, expect, test } from 'bun:test';
import { APPROVAL_LADDERS, routeApproval, type ApprovalRequest } from './approval-ladder';
import { describeApprovalOutcome, describeApprovalRoutes, describeRung } from './approval-ladder-text';

const REPORTED = 'Approvals are wrong for this customer.';
const [CUSTOMER_A, CUSTOMER_B] = APPROVAL_LADDERS;
if (!CUSTOMER_A || !CUSTOMER_B) throw new Error('two customers expected');

function request(overrides: Partial<ApprovalRequest> = {}): ApprovalRequest {
  return { amount: 12_000, needsPriceCheck: true, isOverridden: false, ...overrides };
}

describe('describeRung', () => {
  test('an authority rung states its limit, grouped, or that it signs any amount', () => {
    const [, superintendent] = routeApproval(CUSTOMER_B, request(), 'configured').rungs;
    const [unlimited] = routeApproval(CUSTOMER_A, request(), 'configured').rungs;

    expect(superintendent && describeRung(superintendent)).toBe('Spending authority up to 5,000');
    expect(unlimited && describeRung(unlimited)).toBe('Any amount');
  });
});

describe('describeApprovalOutcome', () => {
  test('approved under the configured engine names who signs, in order', () => {
    const route = routeApproval(CUSTOMER_B, request(), 'configured');

    expect(describeApprovalOutcome(route, REPORTED)).toEqual({
      headline: 'Routed by this customer’s own ladder.',
      detail: 'Signed by Purchasing, Superintendent and Finance.',
    });
  });

  test('a wrong route is headlined with the case study’s own report and names who was never asked', () => {
    const route = routeApproval(CUSTOMER_B, request(), 'hard-coded');

    expect(describeApprovalOutcome(route, REPORTED)).toEqual({
      headline: REPORTED,
      detail: 'Never asked: Purchasing and Finance.',
    });
  });

  test('an override names the steps it skipped', () => {
    const route = routeApproval(CUSTOMER_B, request({ isOverridden: true }), 'configured');

    expect(describeApprovalOutcome(route, REPORTED).detail).toBe('Skipped: Purchasing, Superintendent and Finance.');
  });

  test('a ladder with nobody able to sign has no detail line', () => {
    const capped = { ...CUSTOMER_B, guard: null };
    const route = routeApproval(capped, request({ amount: 30_000 }), 'configured');

    expect(describeApprovalOutcome(route, REPORTED).detail).toBe('');
  });
});

describe('describeApprovalRoutes', () => {
  test('reads each customer’s outcome in order, by name', () => {
    const routes = APPROVAL_LADDERS.map((ladder) => routeApproval(ladder, request(), 'hard-coded'));

    expect(describeApprovalRoutes(routes, REPORTED)).toBe(
      `Customer A: Right for this request. Signed by Superintendent. Customer B: ${REPORTED} Never asked: Purchasing and Finance.`,
    );
  });
});
