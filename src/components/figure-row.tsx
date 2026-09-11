type Figure = {
  readonly value: string;
  readonly label: string;
};

type Props = {
  figures: readonly Figure[];
  /** `panel` for the home masthead, `inline` inside a case study. */
  variant?: 'panel' | 'inline';
};

/**
 * The evidence row. Figures are the argument this site makes, so they get
 * tabular numerals, the mono face, and enough room to be read as data rather
 * than as decoration.
 */
export function FigureRow({ figures, variant = 'panel' }: Props) {
  return (
    <dl
      className={
        variant === 'panel'
          ? 'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4'
          : 'grid grid-cols-2 gap-5 sm:grid-cols-4'
      }
    >
      {figures.map((figure) => (
        <div
          key={`${figure.value}-${figure.label}`}
          className={variant === 'panel' ? 'bg-surface px-4 py-4' : ''}
        >
          <dt className="sr-only">{figure.label}</dt>
          <dd>
            <span className="tnum block font-mono text-h2 font-medium text-ink">{figure.value}</span>
            <span className="mt-1 block text-meta leading-snug text-ink-muted" aria-hidden="true">
              {figure.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
