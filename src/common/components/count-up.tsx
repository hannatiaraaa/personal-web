import type { CSSProperties } from 'react';
import { isCountable, parseFigure } from '@/common/lib/figure-parts';

/**
 * What drives the count. `scroll` follows the figure into view. `load` runs once
 * on a clock as the page paints — for a figure that can sit above the fold,
 * where a view timeline would leave it resting half-counted until a scroll.
 */
export type CountTrigger = 'scroll' | 'load';

type Props = {
  /** The figure exactly as published, e.g. `100+` or `6 years`. */
  value: string;
  countOn?: CountTrigger;
  /** Applied to each painted layer, so a text gradient paints whichever one shows. */
  className?: string;
};

type CountStyle = CSSProperties & Record<'--count-to', number>;

/**
 * A published figure that counts up as it scrolls into view. No JavaScript.
 *
 * The published value is always the real text (crawlers, screen readers and the
 * superseded-figure test read it). The count is an `aria-hidden` layer in the
 * same grid cell: an `@property` integer on a view timeline, printed by a CSS
 * counter. Without view timelines, or under reduced motion, only the value shows.
 * A figure that is not one integer, or needs a thousands separator, renders as written.
 */
export function CountUp({ value, countOn = 'scroll', className = '' }: Props) {
  const parts = parseFigure(value);

  if (parts === null || !isCountable(parts)) {
    return <span className={className}>{value}</span>;
  }

  const style: CountStyle = { '--count-to': parts.integer };

  return (
    <span className='count-up tnum'>
      <span className={`count-up-value ${className}`}>{value}</span>
      <span
        aria-hidden='true'
        data-prefix={parts.prefix}
        data-suffix={parts.suffix}
        data-count-on={countOn}
        style={style}
        className={`count-up-layer ${className}`}
      />
    </span>
  );
}
