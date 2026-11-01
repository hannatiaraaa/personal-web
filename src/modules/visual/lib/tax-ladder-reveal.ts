import { easeProgress } from '@/common/lib/scroll-progress';
import { formatGapPercent, formatMinor, type LadderComparison } from './tax-ladder';

/**
 * How the tax-ladder playground is presented: when each receipt row prints as
 * the scene scrolls, how long the comparison bars are, how the gap counts to a
 * new value, and the sentence a screen reader hears after a change.
 */

export type ReceiptColumn = 'before' | 'after';

/**
 * The slice of the pinned scene's progress over which each receipt prints:
 * the broken receipt first, row by row, then the ladder. What follows — the
 * gap and the controls — is fixed in CSS after these.
 */
export const RECEIPT_REVEAL_WINDOWS = {
  before: { start: 0.04, end: 0.42 },
  after: { start: 0.46, end: 0.7 },
} as const satisfies Record<ReceiptColumn, { start: number; end: number }>;

const REVEAL_DECIMALS = 4;

/** The scene progress at which row `index` of `count` starts to print. */
export function receiptRevealStart(column: ReceiptColumn, index: number, count: number): number {
  const { start, end } = RECEIPT_REVEAL_WINDOWS[column];
  const step = (end - start) / Math.max(count, 1);
  return Number((start + index * step).toFixed(REVEAL_DECIMALS));
}

export type LadderBars = {
  /** The correct total's share of the track. */
  readonly after: number;
  /** The stretch of the before bar past the after bar — the overcharge. */
  readonly over: number;
};

/** Bar lengths, 0–1, with the larger total filling the track. */
export function ladderBarFractions({ before, after }: LadderComparison): LadderBars {
  const longest = Math.max(before.total, after.total, 1);
  const beforeShare = before.total / longest;
  const afterShare = after.total / longest;
  return { after: afterShare, over: Math.max(beforeShare - afterShare, 0) };
}

/** An eased step from `from` to `to` at time `t` (0–1), in whole units. */
export function tweenValue(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * easeProgress(t, 'ease-out'));
}

/** One sentence for the live region: both totals, then the gap. */
export function describeComparison({ before, after, gap, gapBasisPoints }: LadderComparison): string {
  const totals = `Tax at every level: ${formatMinor(before.total)}. One ladder: ${formatMinor(after.total)}.`;
  if (gap === 0) return `${totals} The totals agree.`;
  const direction = gap > 0 ? 'Over' : 'Under';
  return `${totals} ${direction} by ${formatMinor(Math.abs(gap))}, ${formatGapPercent(gapBasisPoints)}.`;
}
