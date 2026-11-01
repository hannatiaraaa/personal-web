'use client';

// Client: holds the lazy reference to the live engine, which only a client module can create.

import { lazy, type ReactNode } from 'react';
import { LiveOnApproach } from './live-on-approach';

const ApprovalEnginePlayground = lazy(() =>
  import('./approval-engine-playground').then((module) => ({ default: module.ApprovalEnginePlayground })),
);

type Props = { reported: string; children: ReactNode };

/** The server-rendered board until the reader nears it, then the live engine. */
export function ApprovalEngineMount({ reported, children }: Props) {
  return <LiveOnApproach live={<ApprovalEnginePlayground reported={reported} />}>{children}</LiveOnApproach>;
}
