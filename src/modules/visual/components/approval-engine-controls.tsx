import { approvalEngineCopy as copy } from '@/content/interactives';
import {
  APPROVAL_AMOUNT_RANGE,
  APPROVAL_POLICIES,
  formatApprovalAmount,
  type ApprovalPolicy,
  type ApprovalRequest,
} from '@/modules/visual/lib/approval-ladder';
import { SegmentedToggle } from './segmented-toggle';

/** The handlers, absent on the server-rendered placeholder, where the controls are shown but not yet live. */
export type ApprovalEngineHandlers = {
  readonly onPolicy: (policy: ApprovalPolicy) => void;
  readonly onAmount: (amount: number) => void;
  readonly onPriceCheck: (needsPriceCheck: boolean) => void;
  readonly onOverride: (isOverridden: boolean) => void;
};

type Props = {
  policy: ApprovalPolicy;
  request: ApprovalRequest;
  handlers?: ApprovalEngineHandlers;
};

function Switch({
  label,
  isChecked,
  onChecked,
}: {
  label: string;
  isChecked: boolean;
  onChecked?: (isChecked: boolean) => void;
}) {
  const live = onChecked
    ? { checked: isChecked, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChecked(event.target.checked) }
    : { defaultChecked: isChecked, disabled: true };

  return (
    <label className='approval-engine-switch'>
      <input
        type='checkbox'
        className='approval-engine-checkbox'
        {...live}
      />
      <span>{label}</span>
    </label>
  );
}

/** Which engine the request runs through — each press re-routes both customers — and the request itself. */
export function ApprovalEngineControls({ policy, request, handlers }: Props) {
  const amount = formatApprovalAmount(request.amount);
  const slider = handlers
    ? {
        value: request.amount,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => handlers.onAmount(Number(event.target.value)),
      }
    : { defaultValue: request.amount, disabled: true };

  return (
    <div className='approval-engine-controls'>
      <SegmentedToggle
        label={copy.policyLabel}
        options={APPROVAL_POLICIES}
        labels={copy.policy}
        selected={policy}
        onSelect={handlers?.onPolicy}
      />

      <label className='approval-engine-amount'>
        <span className='approval-engine-amount-name'>{copy.amountLabel}</span>
        <span
          className='approval-engine-amount-value tnum'
          aria-hidden='true'
        >
          {amount}
        </span>
        <input
          type='range'
          min={APPROVAL_AMOUNT_RANGE.min}
          max={APPROVAL_AMOUNT_RANGE.max}
          step={APPROVAL_AMOUNT_RANGE.step}
          aria-valuetext={amount}
          className='approval-engine-range'
          {...slider}
        />
      </label>

      <div className='approval-engine-switches'>
        <Switch
          label={copy.priceCheckLabel}
          isChecked={request.needsPriceCheck}
          onChecked={handlers?.onPriceCheck}
        />
        <Switch
          label={copy.overrideLabel}
          isChecked={request.isOverridden}
          onChecked={handlers?.onOverride}
        />
      </div>
    </div>
  );
}
