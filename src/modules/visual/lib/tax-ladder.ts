import { groupThousands } from '@/common/lib/group-thousands';

/**
 * The requisition-total bug from the "one arithmetic ladder" case study, as
 * arithmetic a reader can move. Tax applied at line, scope and document level
 * each taxes what a level below already taxed; the fix is one ladder: subtotal,
 * then discount, then tax once.
 *
 * Money is integer minor units, rates are basis points, and every rounding is
 * half up, so no float decimal is summed and a total is exactly reproducible.
 */

export type TaxLevel = 'line' | 'scope' | 'document';

export type RequisitionScope = {
  readonly id: string;
  readonly label: string;
  /** A scope with its own terms, which applied tax at scope level. */
  readonly taxedAtScope: boolean;
};

export type RequisitionLine = {
  readonly id: string;
  readonly label: string;
  readonly quantity: number;
  /** Minor units. */
  readonly unitPrice: number;
  readonly scopeId: string;
  /** A line quoted with its own tax, which applied tax at line level. */
  readonly taxedAtLine: boolean;
};

export type Requisition = {
  readonly scopes: readonly RequisitionScope[];
  readonly lines: readonly RequisitionLine[];
};

export type LadderInputs = {
  readonly requisition: Requisition;
  readonly discountBasisPoints: number;
  readonly taxBasisPoints: number;
  /** The levels configured to apply tax. */
  readonly taxLevels: readonly TaxLevel[];
};

export type LadderRowKind = 'line' | 'subtotal' | 'discount' | 'tax' | 'total';

export type LadderRow = {
  /** Stable across settings, so a receipt row keeps its identity as the numbers move. */
  readonly id: string;
  readonly kind: LadderRowKind;
  readonly level: TaxLevel;
  readonly label: string;
  readonly detail?: string;
  /** Minor units; a discount is negative. */
  readonly amount: number;
  /** A tax computed on a base that already carried tax. */
  readonly isTaxOnTax: boolean;
};

export type LadderResult = {
  readonly rows: readonly LadderRow[];
  /** Minor units. */
  readonly total: number;
  /** All tax charged, minor units. */
  readonly tax: number;
};

export type LadderComparison = {
  readonly before: LadderResult;
  readonly after: LadderResult;
  /** Before minus after, minor units. */
  readonly gap: number;
  /** The gap as a share of the correct total. */
  readonly gapBasisPoints: number;
};

const BASIS_POINTS = 10_000;
const MINOR_PER_MAJOR = 100;
const BASIS_POINTS_PER_PERCENT = 100;
/** A gap is printed to a tenth of a percent: ten basis points. */
const BASIS_POINTS_PER_TENTH = 10;
const TENTHS_PER_PERCENT = 10;
/**
 * Decimals a product is cleaned to before rounding. `1.005 * 100` is
 * `100.49999…` in floating point; at this precision it is the 100.5 meant.
 */
const PRODUCT_PRECISION = 9;
const MINUS = '−';

/**
 * A small requisition, invented for the illustration: spares in a scope with
 * no terms of its own, and a service scope that taxes itself and holds one line
 * quoted with its own tax — so all three levels stack on that one line.
 */
export const ILLUSTRATIVE_REQUISITION: Requisition = {
  scopes: [
    { id: 'spares', label: 'Spares', taxedAtScope: false },
    { id: 'overhaul', label: 'Pump overhaul', taxedAtScope: true },
  ],
  lines: [
    { id: 'filter', label: 'Filter element', quantity: 6, unitPrice: 4_850, scopeId: 'spares', taxedAtLine: false },
    { id: 'hose', label: 'Hydraulic hose', quantity: 2, unitPrice: 13_640, scopeId: 'spares', taxedAtLine: false },
    { id: 'labour', label: 'Labour hours', quantity: 4, unitPrice: 4_500, scopeId: 'overhaul', taxedAtLine: false },
    { id: 'seal', label: 'Seal kit', quantity: 1, unitPrice: 3_850, scopeId: 'overhaul', taxedAtLine: true },
  ],
};

const TAX_LEVELS: readonly TaxLevel[] = ['line', 'scope', 'document'];

/** The opening rates, in whole percent: a gap clearly there, and small enough to pass for rounding. */
export const DEFAULT_TAX_PERCENT = 11;
export const DEFAULT_DISCOUNT_PERCENT = 5;

export const DEFAULT_LADDER_SETTINGS: LadderInputs = {
  requisition: ILLUSTRATIVE_REQUISITION,
  discountBasisPoints: DEFAULT_DISCOUNT_PERCENT * BASIS_POINTS_PER_PERCENT,
  taxBasisPoints: DEFAULT_TAX_PERCENT * BASIS_POINTS_PER_PERCENT,
  taxLevels: TAX_LEVELS,
};

/** Whole-percent ranges for the two controls. */
export const TAX_PERCENT_RANGE = { min: 0, max: 25, step: 1 } as const;
export const DISCOUNT_PERCENT_RANGE = { min: 0, max: 30, step: 1 } as const;

/** Integer division rounded half away from zero; exact for any safe integers. */
function divideRounded(numerator: number, denominator: number): number {
  const sign = Math.sign(numerator) * Math.sign(denominator);
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  const remainder = n % d;
  const quotient = (n - remainder) / d;
  return sign * (remainder * 2 >= d ? quotient + 1 : quotient);
}

/** `basisPoints` of `amount`, in minor units, rounded half up. */
export function percentOf(amount: number, basisPoints: number): number {
  return divideRounded(amount * basisPoints, BASIS_POINTS);
}

/** A rate in percent as basis points, a half rounded up. */
export function percentToBasisPoints(percent: number): number {
  return Math.round(Number((percent * BASIS_POINTS_PER_PERCENT).toFixed(PRODUCT_PRECISION)));
}

/** `1,234.56` from 123456; a true minus sign for a negative amount. */
export function formatMinor(amount: number): string {
  const magnitude = Math.abs(amount);
  const cents = magnitude % MINOR_PER_MAJOR;
  const whole = (magnitude - cents) / MINOR_PER_MAJOR;
  return `${amount < 0 ? MINUS : ''}${groupThousands(whole)}.${String(cents).padStart(2, '0')}`;
}

/** `11%`, or `11.5%` where the rate is not whole. */
export function formatRate(basisPoints: number): string {
  return `${(basisPoints / BASIS_POINTS_PER_PERCENT).toString()}%`;
}

/** `+3.7%` — one decimal, signed, so a gap reads as a direction. */
export function formatGapPercent(basisPoints: number): string {
  const tenths = divideRounded(basisPoints, BASIS_POINTS_PER_TENTH);
  const magnitude = Math.abs(tenths);
  const tenth = magnitude % TENTHS_PER_PERCENT;
  const text = `${(magnitude - tenth) / TENTHS_PER_PERCENT}.${tenth}%`;
  if (tenths > 0) return `+${text}`;
  if (tenths < 0) return `${MINUS}${text}`;
  return text;
}

/** A scope's lines, in the order they were entered: both receipts list lines scope by scope. */
function linesOf(requisition: Requisition, scope: RequisitionScope): readonly RequisitionLine[] {
  return requisition.lines.filter((line) => line.scopeId === scope.id);
}

function lineRow(line: RequisitionLine): LadderRow {
  return {
    id: `line-${line.id}`,
    kind: 'line',
    level: 'line',
    label: line.label,
    detail: `${line.quantity} × ${formatMinor(line.unitPrice)}`,
    amount: line.quantity * line.unitPrice,
    isTaxOnTax: false,
  };
}

function taxRow(id: string, level: TaxLevel, label: string, base: number, rate: number, carried: boolean): LadderRow {
  return {
    id,
    kind: 'tax',
    level,
    label,
    detail: `${formatRate(rate)} of ${formatMinor(base)}`,
    amount: percentOf(base, rate),
    isTaxOnTax: carried,
  };
}

function discountRow(id: string, base: number, rate: number): LadderRow {
  return {
    id,
    kind: 'discount',
    level: 'document',
    label: 'Discount',
    detail: `${formatRate(rate)} of ${formatMinor(base)}`,
    amount: -percentOf(base, rate),
    isTaxOnTax: false,
  };
}

function totalOf(rows: readonly LadderRow[], id: string): LadderResult {
  const total = rows.reduce((sum, row) => (row.kind === 'subtotal' ? sum : sum + row.amount), 0);
  const tax = rows.reduce((sum, row) => (row.kind === 'tax' ? sum + row.amount : sum), 0);
  return {
    rows: [...rows, { id, kind: 'total', level: 'document', label: 'Total', amount: total, isTaxOnTax: false }],
    total,
    tax,
  };
}

/**
 * The bug, reproduced: every configured level taxes what reaches it. A line
 * taxes itself; its scope taxes the taxed line; the document taxes the taxed
 * scope. Discount is the document's, after the lower levels' tax.
 */
export function computeLayered({
  requisition,
  discountBasisPoints,
  taxBasisPoints,
  taxLevels,
}: LadderInputs): LadderResult {
  const rows: LadderRow[] = [];
  const taxesAt = (level: TaxLevel) => taxLevels.includes(level);

  let documentBase = 0;
  let documentCarriedTax = 0;
  for (const scope of requisition.scopes) {
    // Tax already inside this scope's amount, so the level above can see it.
    let amount = 0;
    let carriedTax = 0;
    for (const line of linesOf(requisition, scope)) {
      const row = lineRow(line);
      rows.push(row);
      amount += row.amount;
      if (line.taxedAtLine && taxesAt('line')) {
        const tax = taxRow(`line-tax-${line.id}`, 'line', 'Line tax', row.amount, taxBasisPoints, false);
        rows.push(tax);
        amount += tax.amount;
        carriedTax += tax.amount;
      }
    }
    rows.push({
      id: `scope-${scope.id}`,
      kind: 'subtotal',
      level: 'scope',
      label: `${scope.label} scope`,
      amount,
      isTaxOnTax: false,
    });
    if (scope.taxedAtScope && taxesAt('scope')) {
      const tax = taxRow(`scope-tax-${scope.id}`, 'scope', 'Scope tax', amount, taxBasisPoints, carriedTax > 0);
      rows.push(tax);
      amount += tax.amount;
      carriedTax += tax.amount;
    }
    documentBase += amount;
    documentCarriedTax += carriedTax;
  }

  rows.push({
    id: 'document-subtotal',
    kind: 'subtotal',
    level: 'document',
    label: 'Document subtotal',
    amount: documentBase,
    isTaxOnTax: false,
  });
  const discount = discountRow('document-discount', documentBase, discountBasisPoints);
  rows.push(discount);
  if (taxesAt('document')) {
    const base = documentBase + discount.amount;
    rows.push(taxRow('document-tax', 'document', 'Document tax', base, taxBasisPoints, documentCarriedTax > 0));
  }

  return totalOf(rows, 'layered-total');
}

/**
 * The fix: one ladder. Lines are summed at the grain they were sourced at,
 * the discount comes off that subtotal, and tax is applied once — there is no
 * second rung for it to land on.
 */
export function computeLadder({
  requisition,
  discountBasisPoints,
  taxBasisPoints,
  taxLevels,
}: LadderInputs): LadderResult {
  const rows: LadderRow[] = requisition.scopes.flatMap((scope) => linesOf(requisition, scope).map(lineRow));
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
  rows.push({
    id: 'ladder-subtotal',
    kind: 'subtotal',
    level: 'document',
    label: 'Subtotal at source grain',
    amount: subtotal,
    isTaxOnTax: false,
  });
  const discount = discountRow('ladder-discount', subtotal, discountBasisPoints);
  rows.push(discount);
  if (taxLevels.length > 0) {
    rows.push(taxRow('ladder-tax', 'document', 'Tax, once', subtotal + discount.amount, taxBasisPoints, false));
  }

  return totalOf(rows, 'ladder-total');
}

/** Both totals for the same inputs, and how far the layered one is over. */
export function compareLadders(inputs: LadderInputs): LadderComparison {
  const before = computeLayered(inputs);
  const after = computeLadder(inputs);
  const gap = before.total - after.total;
  const gapBasisPoints = after.total === 0 ? 0 : divideRounded(gap * BASIS_POINTS, after.total);
  return { before, after, gap, gapBasisPoints };
}
