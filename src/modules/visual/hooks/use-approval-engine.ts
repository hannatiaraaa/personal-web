'use client';

// Client: a hook — React state and effects, used only by client components.

import { useMemo, useState } from 'react';
import {
  APPROVAL_LADDERS,
  DEFAULT_APPROVAL_POLICY,
  DEFAULT_APPROVAL_REQUEST,
  routeApproval,
  type ApprovalPolicy,
  type ApprovalRequest,
  type ApprovalRoute,
} from '@/modules/visual/lib/approval-ladder';

export type ApprovalEngine = {
  readonly policy: ApprovalPolicy;
  readonly request: ApprovalRequest;
  /** One per customer, in the order the ladders are listed. */
  readonly routes: readonly ApprovalRoute[];
  /** Whether the reader has changed anything — the live region speaks only then. */
  readonly hasChanged: boolean;
  readonly setPolicy: (policy: ApprovalPolicy) => void;
  readonly setAmount: (amount: number) => void;
  readonly setPriceCheck: (needsPriceCheck: boolean) => void;
  readonly setOverride: (isOverridden: boolean) => void;
};

/** The engine the reader picks, the request they shape, and every customer's route for it. */
export function useApprovalEngine(): ApprovalEngine {
  const [policy, setPolicyState] = useState(DEFAULT_APPROVAL_POLICY);
  const [request, setRequest] = useState(DEFAULT_APPROVAL_REQUEST);
  const [hasChanged, setHasChanged] = useState(false);

  const routes = useMemo(
    () => APPROVAL_LADDERS.map((ladder) => routeApproval(ladder, request, policy)),
    [request, policy],
  );

  // Stable for the component's life: they close over setters only.
  const setters = useMemo(() => {
    const update = (patch: Partial<ApprovalRequest>) => {
      setRequest((current) => ({ ...current, ...patch }));
      setHasChanged(true);
    };
    return {
      setPolicy: (next: ApprovalPolicy) => {
        setPolicyState(next);
        setHasChanged(true);
      },
      setAmount: (amount: number) => update({ amount }),
      setPriceCheck: (needsPriceCheck: boolean) => update({ needsPriceCheck }),
      setOverride: (isOverridden: boolean) => update({ isOverridden }),
    };
  }, []);

  return { policy, request, routes, hasChanged, ...setters };
}
