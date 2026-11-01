import { describe, expect, test } from 'bun:test';
import {
  compareLadders,
  computeLadder,
  computeLayered,
  DEFAULT_LADDER_SETTINGS,
  formatGapPercent,
  formatMinor,
  formatRate,
  ILLUSTRATIVE_REQUISITION,
  percentOf,
  percentToBasisPoints,
  type LadderInputs,
  type Requisition,
} from './tax-ladder';

const ALL_LEVELS = ['line', 'scope', 'document'] as const;

function inputs(overrides: Partial<LadderInputs> = {}): LadderInputs {
  return {
    requisition: ILLUSTRATIVE_REQUISITION,
    discountBasisPoints: 500,
    taxBasisPoints: 1100,
    taxLevels: ALL_LEVELS,
    ...overrides,
  };
}

/** One line in a taxed scope, itself taxed: the smallest document where all three levels stack. */
const ONE_LINE: Requisition = {
  scopes: [{ id: 'service', label: 'Service', taxedAtScope: true }],
  lines: [{ id: 'part', label: 'Part', quantity: 1, unitPrice: 10_000, scopeId: 'service', taxedAtLine: true }],
};

describe('percentOf', () => {
  test('takes a rate in basis points of an amount in minor units', () => {
    expect(percentOf(10_000, 1100)).toBe(1100);
  });

  test('rounds half up to the minor unit', () => {
    // 11% of 0.05 is 0.0055 — half a minor unit, which rounds up.
    expect(percentOf(5, 1100)).toBe(1);
    expect(percentOf(4, 1100)).toBe(0);
  });

  test('is zero at a zero rate', () => {
    expect(percentOf(123_456, 0)).toBe(0);
  });
});

describe('computeLadder — the fix', () => {
  test('subtotals at source grain, then discounts, then taxes once', () => {
    // Arrange: 100.00 net, 5% discount, 11% tax.
    const ladder = computeLadder(inputs({ requisition: ONE_LINE }));

    // Assert: 100.00 − 5.00 = 95.00; 11% of 95.00 = 10.45; 105.45.
    expect(ladder.total).toBe(10_545);
    expect(ladder.tax).toBe(1_045);
  });

  test('has exactly one tax row, whatever levels were configured to tax', () => {
    const ladder = computeLadder(inputs());

    expect(ladder.rows.filter((row) => row.kind === 'tax')).toHaveLength(1);
    expect(ladder.rows.some((row) => row.isTaxOnTax)).toBe(false);
  });

  test('matches the hand-worked total for the illustrative requisition', () => {
    // 291.00 + 272.80 + 180.00 + 38.50 = 782.30; −5% (39.12, half up) = 743.18; +11% (81.75) = 824.93.
    expect(computeLadder(inputs()).total).toBe(82_493);
  });

  test('charges no tax when no level taxes', () => {
    const ladder = computeLadder(inputs({ taxLevels: [] }));

    expect(ladder.tax).toBe(0);
    expect(ladder.rows.filter((row) => row.kind === 'tax')).toHaveLength(0);
  });
});

describe('computeLayered — the bug', () => {
  test('taxes the line, then the scope on the taxed line, then the document on both', () => {
    // Arrange: 100.00, taxed at all three levels, no discount.
    const layered = computeLayered(inputs({ requisition: ONE_LINE, discountBasisPoints: 0 }));

    // Assert: 100.00 → 111.00 → 123.21 → 136.76 (136.7631 rounded).
    expect(layered.total).toBe(13_676);
    expect(layered.rows.filter((row) => row.kind === 'tax').map((row) => row.amount)).toEqual([1_100, 1_221, 1_355]);
  });

  test('marks every tax row whose base already carried tax', () => {
    const layered = computeLayered(inputs({ requisition: ONE_LINE }));
    const taxRows = layered.rows.filter((row) => row.kind === 'tax');

    expect(taxRows.map((row) => row.isTaxOnTax)).toEqual([false, true, true]);
  });

  test('taxes only the lines and scopes configured to tax at their own level', () => {
    const layered = computeLayered(inputs());
    const taxRows = layered.rows.filter((row) => row.kind === 'tax');

    // Seal kit at line level, the service scope, then the document.
    expect(taxRows.map((row) => row.level)).toEqual(['line', 'scope', 'document']);
  });

  test('lists rows in receipt order: each scope after its lines, the document last', () => {
    const ids = computeLayered(inputs()).rows.map((row) => row.id);

    expect(ids).toEqual([
      'line-filter',
      'line-hose',
      'scope-spares',
      'line-labour',
      'line-seal',
      'line-tax-seal',
      'scope-overhaul',
      'scope-tax-overhaul',
      'document-subtotal',
      'document-discount',
      'document-tax',
      'layered-total',
    ]);
  });

  test('is correct on its own: with only the document taxing, it equals the ladder', () => {
    const settings = inputs({ taxLevels: ['document'] });

    expect(computeLayered(settings).total).toBe(computeLadder(settings).total);
  });
});

describe('compareLadders', () => {
  test('the layered total is over the ladder whenever tax is above zero', () => {
    for (const taxBasisPoints of [100, 500, 1100, 2000]) {
      const { gap } = compareLadders(inputs({ taxBasisPoints }));
      expect(gap).toBeGreaterThan(0);
    }
  });

  test('the gap is zero when tax is zero', () => {
    const comparison = compareLadders(inputs({ taxBasisPoints: 0 }));

    expect(comparison.gap).toBe(0);
    expect(comparison.gapBasisPoints).toBe(0);
    expect(comparison.before.total).toBe(comparison.after.total);
  });

  test('starts small enough to pass for rounding and large enough to see', () => {
    const { gapBasisPoints } = compareLadders(DEFAULT_LADDER_SETTINGS);

    expect(gapBasisPoints).toBeGreaterThan(100);
    expect(gapBasisPoints).toBeLessThan(600);
  });

  test('states the gap as before minus after, and as a share of after in basis points', () => {
    const comparison = compareLadders(inputs());

    expect(comparison.gap).toBe(comparison.before.total - comparison.after.total);
    expect(comparison.gapBasisPoints).toBe(Math.round((comparison.gap * 10_000) / comparison.after.total));
  });

  test('a larger tax rate widens the gap', () => {
    const low = compareLadders(inputs({ taxBasisPoints: 500 }));
    const high = compareLadders(inputs({ taxBasisPoints: 2000 }));

    expect(high.gap).toBeGreaterThan(low.gap);
  });
});

describe('money stays in integer minor units', () => {
  test('every amount and total is an integer at every setting', () => {
    for (let tax = 0; tax <= 2500; tax += 100) {
      for (let discount = 0; discount <= 3000; discount += 500) {
        const { before, after, gap } = compareLadders(inputs({ taxBasisPoints: tax, discountBasisPoints: discount }));
        const amounts = [...before.rows, ...after.rows].map((row) => row.amount);
        for (const value of [...amounts, before.total, after.total, gap]) {
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    }
  });

  test('ten-cent lines sum exactly, where floating-point decimals would drift', () => {
    // 0.1 + 0.2 !== 0.3 in floating point; 10 + 20 === 30 in minor units.
    const tenCents: Requisition = {
      scopes: [{ id: 'a', label: 'A', taxedAtScope: false }],
      lines: [
        { id: 'x', label: 'X', quantity: 1, unitPrice: 10, scopeId: 'a', taxedAtLine: false },
        { id: 'y', label: 'Y', quantity: 1, unitPrice: 20, scopeId: 'a', taxedAtLine: false },
      ],
    };

    const ladder = computeLadder(inputs({ requisition: tenCents, taxBasisPoints: 0, discountBasisPoints: 0 }));

    expect(ladder.total).toBe(30);
    expect(formatMinor(ladder.total)).toBe('0.30');
  });
});

describe('percentToBasisPoints', () => {
  test('a whole percent is a hundred basis points each', () => {
    expect(percentToBasisPoints(0)).toBe(0);
    expect(percentToBasisPoints(11)).toBe(1_100);
  });

  test('a fractional percent keeps its fraction', () => {
    expect(percentToBasisPoints(11.5)).toBe(1_150);
  });

  test('a half basis point rounds up, even where the float multiplication lands just under it', () => {
    expect(percentToBasisPoints(0.125)).toBe(13);
    expect(percentToBasisPoints(1.005)).toBe(101);
    expect(percentToBasisPoints(12.345)).toBe(1_235);
  });
});

describe('formatting', () => {
  test('formatRate prints a whole rate without decimals, and a fractional one with them', () => {
    expect(formatRate(1_100)).toBe('11%');
    expect(formatRate(1_150)).toBe('11.5%');
    expect(formatRate(1_125)).toBe('11.25%');
    expect(formatRate(0)).toBe('0%');
  });

  test('formatMinor prints two decimals with thousands separators', () => {
    expect(formatMinor(82_493)).toBe('824.93');
    expect(formatMinor(123_456_789)).toBe('1,234,567.89');
    expect(formatMinor(5)).toBe('0.05');
  });

  test('formatMinor signs a negative amount with a true minus', () => {
    expect(formatMinor(-3_912)).toBe('−39.12');
  });

  test('formatGapPercent prints one decimal with an explicit sign', () => {
    expect(formatGapPercent(367)).toBe('+3.7%');
    expect(formatGapPercent(0)).toBe('0.0%');
    expect(formatGapPercent(-125)).toBe('−1.3%');
  });
});
