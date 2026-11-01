import { DISCOUNT_PERCENT_RANGE, TAX_PERCENT_RANGE } from '@/modules/visual/lib/tax-ladder';

type Props = {
  taxPercent: number;
  discountPercent: number;
  /** Absent on the server-rendered placeholder, where the controls are shown but not yet live. */
  onTaxPercent?: (percent: number) => void;
  onDiscountPercent?: (percent: number) => void;
  onReset?: () => void;
};

type Range = { readonly min: number; readonly max: number; readonly step: number };

function RateControl({
  name,
  value,
  range,
  onValue,
}: {
  name: string;
  value: number;
  range: Range;
  onValue?: (percent: number) => void;
}) {
  const live = onValue
    ? { value, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onValue(Number(event.target.value)) }
    : { defaultValue: value, disabled: true };

  return (
    <label className='tax-ladder-control'>
      <span className='tax-ladder-control-name'>{name}</span>
      <span
        className='tax-ladder-control-value tnum'
        aria-hidden='true'
      >
        {value}%
      </span>
      <input
        type='range'
        min={range.min}
        max={range.max}
        step={range.step}
        aria-valuetext={`${value}%`}
        className='tax-ladder-range'
        {...live}
      />
    </label>
  );
}

/** The two rates the reader can move, and a way back to where the story started. */
export function TaxLadderControls({ taxPercent, discountPercent, onTaxPercent, onDiscountPercent, onReset }: Props) {
  return (
    <div className='tax-ladder-controls'>
      <RateControl
        name='Tax rate'
        value={taxPercent}
        range={TAX_PERCENT_RANGE}
        onValue={onTaxPercent}
      />
      <RateControl
        name='Discount'
        value={discountPercent}
        range={DISCOUNT_PERCENT_RANGE}
        onValue={onDiscountPercent}
      />
      <button
        type='button'
        onClick={onReset}
        disabled={!onReset}
        className='chip tax-ladder-reset'
      >
        Reset
      </button>
    </div>
  );
}
