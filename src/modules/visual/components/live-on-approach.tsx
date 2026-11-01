'use client';

// Client: decides from the viewport when to render the live piece, and so fetch its chunk.

import { Suspense, useDeferredValue, useRef, type ReactNode } from 'react';
import { useLatchedInViewport } from '@/common/hooks/use-latched-in-viewport';

/** One viewport ahead: the live piece has replaced the placeholder before the reader arrives. */
const LOAD_MARGIN = '100% 0px';

type Props = {
  /** The live piece, usually a `React.lazy` component; its chunk loads when it first renders. */
  live: ReactNode;
  /** The server-rendered placeholder: the same markup, controls not yet live. */
  children: ReactNode;
};

/**
 * Shows the placeholder until it comes within a viewport, then swaps in the
 * live piece once its chunk has loaded. Both render the same markup, so nothing shifts. `React.lazy`
 * rather than `next/dynamic` on the caller's side: a fallback passed in as
 * children is something `next/dynamic`'s `loading` cannot receive.
 */
export function LiveOnApproach({ live, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Latched: once live, scrolling away must not throw away what the reader set.
  const isNear = useLatchedInViewport(ref, LOAD_MARGIN);
  // Deferred, so the placeholder stays until the chunk has loaded and the swap
  // is one commit. Shown as a fallback instead, it was removed a frame before
  // the live piece arrived, and the page, shorter for that frame, clamped the
  // scroll: a reader who had just jumped below it landed at the bottom.
  const isWanted = useDeferredValue(isNear);

  return (
    <div ref={ref}>
      <Suspense fallback={children}>{isWanted ? live : children}</Suspense>
    </div>
  );
}
