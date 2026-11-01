'use client';

// Client: the reader moves the rates (state, input handlers, a rAF count).

import { useDebouncedAnnouncement } from '@/modules/visual/hooks/use-debounced-announcement';
import { useTaxLadderPlayground } from '@/modules/visual/hooks/use-tax-ladder-playground';
import { useTweenedValues } from '@/modules/visual/hooks/use-tweened-values';
import { describeComparison } from '@/modules/visual/lib/tax-ladder-reveal';
import { TaxLadderBoard } from './tax-ladder-board';
import { TaxLadderControls } from './tax-ladder-controls';

/** The live tax-ladder board: both receipts recomputed as the reader moves a rate. */
export function TaxLadderPlayground() {
  const playground = useTaxLadderPlayground();
  const { comparison } = playground;
  const [shownGap = comparison.gap, shownGapBasisPoints = comparison.gapBasisPoints] = useTweenedValues([
    comparison.gap,
    comparison.gapBasisPoints,
  ]);
  const announcement = useDebouncedAnnouncement(describeComparison(comparison), playground.hasChanged);

  return (
    <TaxLadderBoard
      comparison={comparison}
      shownGap={shownGap}
      shownGapBasisPoints={shownGapBasisPoints}
      announcement={announcement}
      hasChanged={playground.hasChanged}
      controls={
        <TaxLadderControls
          taxPercent={playground.taxPercent}
          discountPercent={playground.discountPercent}
          onTaxPercent={playground.setTaxPercent}
          onDiscountPercent={playground.setDiscountPercent}
          onReset={playground.reset}
        />
      }
    />
  );
}
