'use client';

// Client: holds the lazy reference to the live simulator, which only a client module can create.

import { lazy, type ReactNode } from 'react';
import { LiveOnApproach } from './live-on-approach';

const DraftSyncSimulator = lazy(() =>
  import('./draft-sync-simulator').then((module) => ({ default: module.DraftSyncSimulator })),
);

type Props = { reported: string; placeholder: ReactNode };

/** The static stand-in until the reader nears it, then the live simulator, already running when it arrives. */
export function DraftSyncMount({ reported, placeholder }: Props) {
  return <LiveOnApproach live={<DraftSyncSimulator reported={reported} />}>{placeholder}</LiveOnApproach>;
}
