import type { CSSProperties, ReactNode } from 'react';
import { illustrativeLabels, tryItLegend } from '@/content/interactive-labels';
import { formatGapPercent, formatMinor, type LadderComparison } from '@/modules/visual/lib/tax-ladder';
import { describeComparison, ladderBarFractions } from '@/modules/visual/lib/tax-ladder-reveal';
import { TaxLadderReceipt } from './tax-ladder-receipt';

/** A bar's share of its track, read by `.tax-ladder-bar`; the overcharge also starts where the correct total ends. */
type BarStyle = CSSProperties & Record<'--bar', number>;
type OverStyle = CSSProperties & Record<'--bar' | '--bar-at', number>;

type Props = {
  comparison: LadderComparison;
  /** The gap as currently counted on screen, which trails `comparison` for a moment after a change. */
  shownGap: number;
  shownGapBasisPoints: number;
  controls: ReactNode;
  /** The polite live region's text: empty until the reader changes something. */
  announcement: string;
  /** Once the reader has changed something, the scene shows whole whatever the scroll. */
  hasChanged: boolean;
};

/**
 * The playground's face: two receipts for the same requisition, the gap
 * between their totals, and the controls. Holds no state, so the server
 * renders it as the placeholder and the playground re-renders it live.
 */
export function TaxLadderBoard({
  comparison,
  shownGap,
  shownGapBasisPoints,
  controls,
  announcement,
  hasChanged,
}: Props) {
  const bars = ladderBarFractions(comparison);
  const correctBar: BarStyle = { '--bar': bars.after };
  const overBar: OverStyle = { '--bar-at': bars.after, '--bar': bars.over };
  const isOver = comparison.gap !== 0;

  return (
    <div
      className='tax-ladder-board'
      data-changed={hasChanged ? '' : undefined}
    >
      <div className='tax-ladder-head'>
        <p className='legend'>{tryItLegend}</p>
        <p className='legend'>{illustrativeLabels.numbers}</p>
      </div>

      <div className='tax-ladder-receipts'>
        <TaxLadderReceipt
          column='before'
          heading='Before — tax at every level'
          result={comparison.before}
        />
        <TaxLadderReceipt
          column='after'
          heading='After — one ladder'
          result={comparison.after}
        />
      </div>

      <div className='tax-ladder-console-clip'>
        <div className='tax-ladder-console'>
          <div className='tax-ladder-gap'>
            <p
              className='tax-ladder-gap-figure tnum'
              data-tax-ladder-gap
            >
              {formatGapPercent(shownGapBasisPoints)}
              {isOver && <span className='tax-ladder-gap-suffix'>over</span>}
            </p>
            <p className='tax-ladder-gap-caption tnum'>
              {isOver
                ? `${formatMinor(shownGap)} over on a ${formatMinor(comparison.after.total)} requisition — and every level checks out alone.`
                : 'No gap. With no tax there is nothing to tax twice.'}
            </p>
            <div
              role='img'
              aria-label={describeComparison(comparison)}
              className='tax-ladder-bars'
            >
              <div className='tax-ladder-bar-row'>
                <span className='tax-ladder-bar-name'>Every level</span>
                <span className='tax-ladder-bar-track'>
                  <span
                    className='tax-ladder-bar tax-ladder-bar-before'
                    style={correctBar}
                  />
                  <span
                    className='tax-ladder-bar-over'
                    style={overBar}
                  />
                </span>
                <span className='tax-ladder-bar-amount tnum'>{formatMinor(comparison.before.total)}</span>
              </div>
              <div className='tax-ladder-bar-row'>
                <span className='tax-ladder-bar-name'>One ladder</span>
                <span className='tax-ladder-bar-track'>
                  <span
                    className='tax-ladder-bar tax-ladder-bar-after'
                    style={correctBar}
                  />
                </span>
                <span className='tax-ladder-bar-amount tnum'>{formatMinor(comparison.after.total)}</span>
              </div>
            </div>
          </div>
          {controls}
        </div>
      </div>

      <p
        aria-live='polite'
        className='sr-only'
      >
        {announcement}
      </p>
    </div>
  );
}
