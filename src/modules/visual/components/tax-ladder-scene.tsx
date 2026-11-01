import { ScrollScene } from '@/common/components/scroll-scene';
import { PIN_QUERY } from '@/common/lib/media-queries';
import {
  compareLadders,
  DEFAULT_DISCOUNT_PERCENT,
  DEFAULT_LADDER_SETTINGS,
  DEFAULT_TAX_PERCENT,
} from '@/modules/visual/lib/tax-ladder';
import { TaxLadderBoard } from './tax-ladder-board';
import { TaxLadderControls } from './tax-ladder-controls';
import { TaxLadderPlaygroundMount } from './tax-ladder-playground-mount';

/**
 * The tax-ladder interactive. Pinned on a big enough screen: the broken receipt
 * prints row by row, then the ladder, the gap and the controls. Below that, and
 * under reduced motion, it is the finished board in plain flow.
 */
export function TaxLadderScene() {
  const comparison = compareLadders(DEFAULT_LADDER_SETTINGS);

  return (
    <ScrollScene
      mode='pinned'
      liveQuery={PIN_QUERY}
      className='tax-ladder-scene'
      label='Try it: tax at every level against one ladder'
    >
      <div className='tax-ladder-sticky'>
        <TaxLadderPlaygroundMount>
          <TaxLadderBoard
            comparison={comparison}
            shownGap={comparison.gap}
            shownGapBasisPoints={comparison.gapBasisPoints}
            announcement=''
            hasChanged={false}
            controls={
              <TaxLadderControls
                taxPercent={DEFAULT_TAX_PERCENT}
                discountPercent={DEFAULT_DISCOUNT_PERCENT}
              />
            }
          />
        </TaxLadderPlaygroundMount>
      </div>
    </ScrollScene>
  );
}
