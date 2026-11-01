import { approvalEngineCopy as copy } from '@/content/interactives';
import { formatApprovalAmount, type ApprovalRoute, type ApprovalRung, type ApproverRole } from './approval-ladder';

/** What a rung is for, in the board's words: an authority rung states its limit. */
export function describeRung(rung: ApprovalRung): string {
  if (rung.reason === 'authority') {
    return copy.reason.authority(rung.limit === null ? null : formatApprovalAmount(rung.limit));
  }
  return copy.reason[rung.reason]();
}

function namesOf(roles: readonly ApproverRole[]): string[] {
  return roles.map((role) => copy.role[role]);
}

/**
 * The headline and the line beneath it for one customer's outcome. A wrong
 * route is headlined with `reported`, the case study's own sentence.
 */
export function describeApprovalOutcome(
  route: ApprovalRoute,
  reported: string,
): { readonly headline: string; readonly detail: string } {
  const { outcome } = route;
  switch (outcome.kind) {
    case 'approved':
      return { headline: copy.headline.approved[route.policy], detail: copy.detail.signedBy(namesOf(route.approvers)) };
    case 'bypassed':
      return { headline: copy.headline.bypassed, detail: copy.detail.skipped(namesOf(outcome.skipped)) };
    case 'wrong': {
      const lines: string[] = [];
      if (outcome.missing.length > 0) lines.push(copy.detail.neverAsked(namesOf(outcome.missing)));
      if (outcome.unexpected.length > 0) lines.push(copy.detail.askedInstead(namesOf(outcome.unexpected)));
      return { headline: reported, detail: lines.join(' ') };
    }
    case 'no-authority':
      return { headline: copy.headline['no-authority'], detail: '' };
  }
}

/** What the live region says: each customer's outcome, in order. */
export function describeApprovalRoutes(routes: readonly ApprovalRoute[], reported: string): string {
  return routes
    .map((route) => {
      const { headline, detail } = describeApprovalOutcome(route, reported);
      return `${copy.customer[route.customer].name}: ${headline} ${detail}`.trim();
    })
    .join(' ');
}
