'use client';

// Client: holds the lazy reference to the live playground, which only a client module can create.

import { lazy, type ReactNode } from 'react';
import { LiveOnApproach } from './live-on-approach';

const TaxLadderPlayground = lazy(() =>
  import('./tax-ladder-playground').then((module) => ({ default: module.TaxLadderPlayground })),
);

/** The server-rendered board at its opening rates until the reader nears it, then the live playground. */
export function TaxLadderPlaygroundMount({ children }: { children: ReactNode }) {
  return <LiveOnApproach live={<TaxLadderPlayground />}>{children}</LiveOnApproach>;
}
