import type { ReactNode } from 'react';
import { approvalEngineCopy as copy } from '@/content/interactives';
import { illustrativeLabels, tryItLegend } from '@/content/interactive-labels';
import type { ApprovalPolicy, ApprovalRoute } from '@/modules/visual/lib/approval-ladder';
import { ApprovalEngineLadder } from './approval-engine-ladder';

type Props = {
  policy: ApprovalPolicy;
  routes: readonly ApprovalRoute[];
  reported: string;
  controls: ReactNode;
  /** The polite live region's text: empty until the reader changes something. */
  announcement: string;
};

/**
 * The approval engine's face: the controls, then the same requisition routed
 * through each customer's ladder side by side. Holds no state, so the server
 * renders it as the placeholder and the live piece re-renders it.
 */
export function ApprovalEngineBoard({ policy, routes, reported, controls, announcement }: Props) {
  return (
    <div
      className='approval-engine-board'
      data-policy={policy}
    >
      <div className='approval-engine-head'>
        <p className='legend'>{tryItLegend}</p>
        <p className='legend'>{illustrativeLabels.numbers}</p>
      </div>

      {controls}

      <div className='approval-engine-customers'>
        {routes.map((route) => (
          <ApprovalEngineLadder
            key={route.customer}
            route={route}
            reported={reported}
          />
        ))}
      </div>

      <p className='approval-engine-note'>{copy.note[policy]}</p>

      <p
        aria-live='polite'
        className='sr-only'
      >
        {announcement}
      </p>
    </div>
  );
}
