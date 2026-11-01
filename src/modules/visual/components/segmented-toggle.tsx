type Props<Option extends string> = {
  /** Names the group for assistive tech. */
  label: string;
  options: readonly Option[];
  labels: Readonly<Record<Option, string>>;
  selected: Option;
  /** Absent on a server-rendered stand-in, which shows the same toggle disabled. */
  onSelect?: (option: Option) => void;
  className?: string;
};

/**
 * Pressed-state buttons on one track, rather than a radio group: each press is
 * an action — it replays or re-routes the piece — so a button is what a
 * keyboard or screen-reader user expects.
 */
export function SegmentedToggle<Option extends string>({
  label,
  options,
  labels,
  selected,
  onSelect,
  className = '',
}: Props<Option>) {
  return (
    <div
      role='group'
      aria-label={label}
      className={`segmented ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          type='button'
          aria-pressed={option === selected}
          disabled={!onSelect}
          onClick={onSelect ? () => onSelect(option) : undefined}
          className='segmented-option press'
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
