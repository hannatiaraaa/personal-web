import {
  APPROVAL_LADDERS,
  DEFAULT_APPROVAL_POLICY,
  DEFAULT_APPROVAL_REQUEST,
  routeApproval,
} from '@/modules/visual/lib/approval-ladder';
import { approvalEngineCopy as copy } from '@/content/interactives';
import { ApprovalEngineBoard } from './approval-engine-board';
import { ApprovalEngineControls } from './approval-engine-controls';
import { ApprovalEngineMount } from './approval-engine-mount';

/**
 * The approval engine, server side: one requisition routed through two
 * customers' ladders, with the engine it replaced one press away. Not pinned —
 * it is static until the reader moves a control, and before hydration, without
 * JavaScript and under reduced motion it is the finished opening board.
 */
export function ApprovalEngineInteractive({ reported }: { reported: string }) {
  const routes = APPROVAL_LADDERS.map((ladder) =>
    routeApproval(ladder, DEFAULT_APPROVAL_REQUEST, DEFAULT_APPROVAL_POLICY),
  );

  return (
    <section
      className='approval-engine'
      aria-label={copy.label}
    >
      <ApprovalEngineMount reported={reported}>
        <ApprovalEngineBoard
          policy={DEFAULT_APPROVAL_POLICY}
          routes={routes}
          reported={reported}
          announcement=''
          controls={
            <ApprovalEngineControls
              policy={DEFAULT_APPROVAL_POLICY}
              request={DEFAULT_APPROVAL_REQUEST}
            />
          }
        />
      </ApprovalEngineMount>
    </section>
  );
}
