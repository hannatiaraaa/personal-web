import { CountUp, type CountTrigger } from './count-up';

type Figure = {
  readonly value: string;
  readonly label: string;
};

type Props = {
  figures: readonly Figure[];
  /** `panel` for a masthead, `inline` inside a case study section. */
  variant?: 'panel' | 'inline';
  /** Count each figure up as it scrolls in. The published value stays the text either way. */
  animate?: boolean;
  /** What drives the count when animated. `load` for a row that can be above the fold. */
  countOn?: CountTrigger;
};

/**
 * Figures get the mono face and tabular numerals. The label is rendered once for
 * assistive tech and once visually, because a bare number announces nothing.
 */
export function FigureRow({ figures, variant = 'panel', animate = false, countOn = 'scroll' }: Props) {
  const isPanel = variant === 'panel';
  // The text gradient moves onto the counting layers when animated: a gradient
  // clipped to this span's text would also paint the unpainted value beneath.
  const gradient = isPanel ? 'signal-text' : '';

  return (
    <dl
      className={
        isPanel
          ? 'border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border sm:grid-cols-4'
          : 'grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4'
      }
    >
      {figures.map((figure) => (
        <div
          key={`${figure.value}-${figure.label}`}
          className={isPanel ? 'bg-surface hover:bg-surface-sunk px-4 py-5 transition-colors' : ''}
        >
          <dt className='sr-only'>{figure.label}</dt>
          <dd>
            <span
              className={`tnum block font-mono font-medium tracking-[-0.02em] ${
                isPanel ? 'text-h2' : 'text-h3 text-ink'
              } ${animate ? '' : gradient}`}
            >
              {animate ? (
                <CountUp
                  value={figure.value}
                  countOn={countOn}
                  className={gradient}
                />
              ) : (
                figure.value
              )}
            </span>
            <span
              aria-hidden='true'
              className='text-meta text-ink-muted mt-1.5 block leading-snug'
            >
              {figure.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
