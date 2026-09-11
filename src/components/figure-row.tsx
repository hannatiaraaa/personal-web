type Figure = {
  readonly value: string;
  readonly label: string;
};

type Props = {
  figures: readonly Figure[];
  /** `panel` for a masthead, `inline` inside a case study section. */
  variant?: 'panel' | 'inline';
};

/**
 * Figures are the argument this site makes, so they get the mono face, tabular
 * numerals and enough room to read as data. The label is rendered once for
 * assistive tech and once visually, because the visual pairing is what carries
 * the meaning and a bare number would announce nothing.
 */
export function FigureRow({ figures, variant = 'panel' }: Props) {
  const isPanel = variant === 'panel';

  return (
    <dl
      className={
        isPanel
          ? 'grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-4'
          : 'grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4'
      }
    >
      {figures.map((figure) => (
        <div
          key={`${figure.value}-${figure.label}`}
          className={isPanel ? 'bg-surface px-4 py-5 transition-colors hover:bg-surface-sunk' : ''}
        >
          <dt className="sr-only">{figure.label}</dt>
          <dd>
            <span
              className={`tnum block font-mono font-medium tracking-[-0.02em] ${
                isPanel ? 'signal-text text-h2' : 'text-h3 text-ink'
              }`}
            >
              {figure.value}
            </span>
            <span aria-hidden="true" className="mt-1.5 block text-meta leading-snug text-ink-muted">
              {figure.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
