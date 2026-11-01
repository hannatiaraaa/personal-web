/**
 * The approval engine's routing, as a pure function: given a customer's
 * configured ladder and a requisition, who must approve it, in what order, and
 * why. The same function also plays the engine it replaced — one approver in
 * the code for every customer — so the two can be compared on the same request.
 *
 * Every ladder, limit and amount here is invented for the illustration.
 */

import { groupThousands } from '@/common/lib/group-thousands';

export const APPROVAL_POLICIES = ['hard-coded', 'configured'] as const;
export type ApprovalPolicy = (typeof APPROVAL_POLICIES)[number];

export type ApproverRole = 'superintendent' | 'purchasing' | 'finance' | 'director';
export type ApprovalCustomer = 'a' | 'b';

/** One step of sequential authority. `limit: null` signs any amount. */
export type ApprovalTier = { readonly role: ApproverRole; readonly limit: number | null };

/** A customer's ladder, as their business configures it. */
export type ApprovalLadder = {
  readonly customer: ApprovalCustomer;
  /** Checks the price before anyone approves, whenever a request needs it. */
  readonly priceCheck: ApproverRole | null;
  /** Climbed in order until one approver's authority covers the amount. The last is the budget owner. */
  readonly tiers: readonly [ApprovalTier, ...ApprovalTier[]];
  /** Signs as well, above the budget owner's limit. */
  readonly guard: ApproverRole | null;
  /** May approve alone, short-circuiting the ladder. */
  readonly superApprover: ApproverRole | null;
};

export type ApprovalRequest = {
  readonly amount: number;
  readonly needsPriceCheck: boolean;
  /** The super-approver signs it straight through. */
  readonly isOverridden: boolean;
};

export type RungReason = 'price-check' | 'authority' | 'guard' | 'override' | 'hard-coded';

/**
 * `required` signs this request; `skipped` is configured but not needed for it;
 * `bypassed` was needed and was overridden; `missed` was needed by the
 * customer's rule and never asked, because the code did not know it existed.
 */
export type RungStatus = 'required' | 'skipped' | 'bypassed' | 'missed';

export type ApprovalRung = {
  readonly role: ApproverRole;
  readonly reason: RungReason;
  /** The approver's spending authority, on an authority rung; `null` otherwise or when unlimited. */
  readonly limit: number | null;
  readonly status: RungStatus;
};

export type ApprovalOutcome =
  | { readonly kind: 'approved' }
  | { readonly kind: 'bypassed'; readonly by: ApproverRole; readonly skipped: readonly ApproverRole[] }
  | { readonly kind: 'wrong'; readonly missing: readonly ApproverRole[]; readonly unexpected: readonly ApproverRole[] }
  | { readonly kind: 'no-authority' };

export type ApprovalRoute = {
  readonly customer: ApprovalCustomer;
  readonly policy: ApprovalPolicy;
  /** Every rung drawn for this customer, in the order a request meets them. */
  readonly rungs: readonly ApprovalRung[];
  /** Who signs, in order. */
  readonly approvers: readonly ApproverRole[];
  readonly outcome: ApprovalOutcome;
};

/** The one approver the first engine knew, for every customer. */
export const HARD_CODED_APPROVER: ApproverRole = 'superintendent';

/** Two customers: the one the code was written for, and the hierarchy that arrived second. */
export const APPROVAL_LADDERS: readonly ApprovalLadder[] = [
  {
    customer: 'a',
    priceCheck: null,
    tiers: [{ role: 'superintendent', limit: null }],
    guard: null,
    superApprover: 'director',
  },
  {
    customer: 'b',
    priceCheck: 'purchasing',
    tiers: [
      { role: 'superintendent', limit: 5_000 },
      { role: 'finance', limit: 25_000 },
    ],
    guard: 'director',
    superApprover: 'director',
  },
];

/** Opens on the fix: each customer routed by their own ladder. */
export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = 'configured';

export const APPROVAL_AMOUNT_RANGE = { min: 500, max: 40_000, step: 500 } as const;

/** Opens over the first tier with a price check, so every kind of rung is in play on the second customer. */
export const DEFAULT_APPROVAL_REQUEST: ApprovalRequest = {
  amount: 12_000,
  needsPriceCheck: true,
  isOverridden: false,
};

const isRequired = (rung: ApprovalRung) => rung.status === 'required';
const rolesOf = (rungs: readonly ApprovalRung[]) => rungs.map((rung) => rung.role);

/** The rungs the customer's own rule draws for this request, before any override. */
function configuredRungs(ladder: ApprovalLadder, { amount, needsPriceCheck }: ApprovalRequest): ApprovalRung[] {
  const rungs: ApprovalRung[] = [];

  if (ladder.priceCheck) {
    rungs.push({
      role: ladder.priceCheck,
      reason: 'price-check',
      limit: null,
      status: needsPriceCheck ? 'required' : 'skipped',
    });
  }

  // Each tier signs until one has the authority for the amount; the rest are not asked.
  let isCovered = false;
  for (const tier of ladder.tiers) {
    rungs.push({ role: tier.role, reason: 'authority', limit: tier.limit, status: isCovered ? 'skipped' : 'required' });
    if (tier.limit === null || amount <= tier.limit) isCovered = true;
  }

  if (ladder.guard) {
    rungs.push({ role: ladder.guard, reason: 'guard', limit: null, status: isCovered ? 'skipped' : 'required' });
  }

  return rungs;
}

function isWithinAuthority(ladder: ApprovalLadder, amount: number): boolean {
  if (ladder.guard) return true;
  return ladder.tiers.some((tier) => tier.limit === null || amount <= tier.limit);
}

function withOutcome(
  ladder: ApprovalLadder,
  policy: ApprovalPolicy,
  rungs: readonly ApprovalRung[],
  outcome: ApprovalOutcome,
): ApprovalRoute {
  return { customer: ladder.customer, policy, rungs, approvers: rolesOf(rungs.filter(isRequired)), outcome };
}

/** The engine it replaced: one approver, whoever the customer. The customer's rule is drawn to show what it misses. */
function routeHardCoded(ladder: ApprovalLadder, request: ApprovalRequest): ApprovalRoute {
  const rule = configuredRungs(ladder, request);
  const needed = rolesOf(rule.filter(isRequired));

  const rungs: ApprovalRung[] = rule.map((rung) => {
    if (rung.role === HARD_CODED_APPROVER && rung.reason === 'authority') return { ...rung, status: 'required' };
    return { ...rung, status: rung.status === 'required' ? 'missed' : 'skipped' };
  });
  const hasHardCodedRung = rungs.some(isRequired);
  if (!hasHardCodedRung) {
    rungs.unshift({ role: HARD_CODED_APPROVER, reason: 'hard-coded', limit: null, status: 'required' });
  }

  const missing = needed.filter((role) => role !== HARD_CODED_APPROVER);
  const unexpected = needed.includes(HARD_CODED_APPROVER) ? [] : [HARD_CODED_APPROVER];
  const outcome: ApprovalOutcome =
    missing.length === 0 && unexpected.length === 0 ? { kind: 'approved' } : { kind: 'wrong', missing, unexpected };

  return withOutcome(ladder, 'hard-coded', rungs, outcome);
}

/** Routes a requisition through a customer's ladder, or through the single approver the code once had. */
export function routeApproval(ladder: ApprovalLadder, request: ApprovalRequest, policy: ApprovalPolicy): ApprovalRoute {
  if (policy === 'hard-coded') return routeHardCoded(ladder, request);

  const rungs = configuredRungs(ladder, request);

  const { superApprover } = ladder;
  if (request.isOverridden && superApprover) {
    // A rung the super-approver holds is signed by the override itself, so it is not one they skipped.
    const isSkipped = (rung: ApprovalRung) => isRequired(rung) && rung.role !== superApprover;
    const skipped = rolesOf(rungs.filter(isSkipped));
    const bypassed: ApprovalRung[] = rungs.map((rung) => {
      if (isSkipped(rung)) return { ...rung, status: 'bypassed' };
      return isRequired(rung) ? { ...rung, status: 'skipped' } : rung;
    });
    bypassed.push({ role: superApprover, reason: 'override', limit: null, status: 'required' });
    return withOutcome(ladder, policy, bypassed, { kind: 'bypassed', by: superApprover, skipped });
  }

  const outcome: ApprovalOutcome = isWithinAuthority(ladder, request.amount)
    ? { kind: 'approved' }
    : { kind: 'no-authority' };
  return withOutcome(ladder, policy, rungs, outcome);
}

/** A whole amount as printed on the board: thousands grouped, no currency, no decimals. */
export function formatApprovalAmount(amount: number): string {
  return groupThousands(Math.round(amount));
}
