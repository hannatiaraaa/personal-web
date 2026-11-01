'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useMemo, useState } from 'react';
import {
  compareLadders,
  DEFAULT_DISCOUNT_PERCENT,
  DEFAULT_LADDER_SETTINGS,
  DEFAULT_TAX_PERCENT,
  percentToBasisPoints,
  type LadderComparison,
} from '@/modules/visual/lib/tax-ladder';

export type TaxLadderPlayground = {
  readonly taxPercent: number;
  readonly discountPercent: number;
  readonly comparison: LadderComparison;
  /** Whether the reader has changed anything — the live region speaks only then. */
  readonly hasChanged: boolean;
  readonly setTaxPercent: (percent: number) => void;
  readonly setDiscountPercent: (percent: number) => void;
  readonly reset: () => void;
};

/** The two rates the reader controls, and both receipts computed from them. */
export function useTaxLadderPlayground(): TaxLadderPlayground {
  const [taxPercent, setTax] = useState(DEFAULT_TAX_PERCENT);
  const [discountPercent, setDiscount] = useState(DEFAULT_DISCOUNT_PERCENT);
  const [hasChanged, setHasChanged] = useState(false);

  const comparison = useMemo(
    () =>
      compareLadders({
        ...DEFAULT_LADDER_SETTINGS,
        taxBasisPoints: percentToBasisPoints(taxPercent),
        discountBasisPoints: percentToBasisPoints(discountPercent),
      }),
    [taxPercent, discountPercent],
  );

  const setTaxPercent = useCallback((percent: number) => {
    setTax(percent);
    setHasChanged(true);
  }, []);

  const setDiscountPercent = useCallback((percent: number) => {
    setDiscount(percent);
    setHasChanged(true);
  }, []);

  const reset = useCallback(() => {
    setTax(DEFAULT_TAX_PERCENT);
    setDiscount(DEFAULT_DISCOUNT_PERCENT);
    setHasChanged(true);
  }, []);

  return { taxPercent, discountPercent, comparison, hasChanged, setTaxPercent, setDiscountPercent, reset };
}
