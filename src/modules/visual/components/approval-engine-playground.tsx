'use client';

// Client: the reader changes the request and the engine (state, input handlers).

import { useMemo } from 'react';
import { useApprovalEngine } from '@/modules/visual/hooks/use-approval-engine';
import { useDebouncedAnnouncement } from '@/modules/visual/hooks/use-debounced-announcement';
import { describeApprovalRoutes } from '@/modules/visual/lib/approval-ladder-text';
import { ApprovalEngineBoard } from './approval-engine-board';
import { ApprovalEngineControls, type ApprovalEngineHandlers } from './approval-engine-controls';

/** The live approval engine: both customers re-routed as the reader changes the request or the engine. */
export function ApprovalEnginePlayground({ reported }: { reported: string }) {
  const engine = useApprovalEngine();
  const announcement = useDebouncedAnnouncement(describeApprovalRoutes(engine.routes, reported), engine.hasChanged);
  const { setPolicy, setAmount, setPriceCheck, setOverride } = engine;
  const handlers = useMemo<ApprovalEngineHandlers>(
    () => ({ onPolicy: setPolicy, onAmount: setAmount, onPriceCheck: setPriceCheck, onOverride: setOverride }),
    [setPolicy, setAmount, setPriceCheck, setOverride],
  );

  return (
    <ApprovalEngineBoard
      policy={engine.policy}
      routes={engine.routes}
      reported={reported}
      announcement={announcement}
      controls={
        <ApprovalEngineControls
          policy={engine.policy}
          request={engine.request}
          handlers={handlers}
        />
      }
    />
  );
}
