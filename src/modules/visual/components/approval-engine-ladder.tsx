import { approvalEngineCopy as copy } from '@/content/interactives';
import type { ApprovalRoute } from '@/modules/visual/lib/approval-ladder';
import { describeApprovalOutcome, describeRung } from '@/modules/visual/lib/approval-ladder-text';

type Props = {
  route: ApprovalRoute;
  /** The case study's own words, shown where the hard-coded engine gets a customer wrong. */
  reported: string;
};

/** One customer's ladder: the requester, each configured rung lit or not for this request, and where it ended. */
export function ApprovalEngineLadder({ route, reported }: Props) {
  const customer = copy.customer[route.customer];
  const { headline, detail } = describeApprovalOutcome(route, reported);
  const headingId = `approval-engine-${route.customer}`;

  return (
    <section
      aria-labelledby={headingId}
      className='approval-engine-customer'
      data-customer={route.customer}
    >
      <h3
        id={headingId}
        className='approval-engine-customer-name'
      >
        {customer.name}
        <span className='approval-engine-customer-rule'>{customer.rule}</span>
      </h3>

      <ol className='approval-engine-rungs'>
        <li className='approval-engine-rung'>
          <span className='approval-engine-rung-role'>{copy.requester.name}</span>
          <span className='approval-engine-rung-reason'>{copy.requester.line}</span>
        </li>
        {route.rungs.map((rung) => (
          <li
            key={`${rung.reason}-${rung.role}`}
            className='approval-engine-rung'
            data-status={rung.status}
          >
            <span className='approval-engine-rung-role'>{copy.role[rung.role]}</span>
            <span className='approval-engine-rung-reason tnum'>{describeRung(rung)}</span>
            <span className='approval-engine-rung-status'>{copy.status[rung.status]}</span>
          </li>
        ))}
      </ol>

      <div
        className='approval-engine-outcome'
        data-outcome={route.outcome.kind}
        data-approval-outcome={route.customer}
      >
        <p className='approval-engine-outcome-headline'>{headline}</p>
        {detail && <p className='approval-engine-outcome-detail'>{detail}</p>}
      </div>
    </section>
  );
}
