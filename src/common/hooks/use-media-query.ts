'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useSyncExternalStore } from 'react';

/** What the server renders, and what a hydrating client renders first, so the two agree. */
const SERVER_MATCH = false;

function getServerSnapshot(): boolean {
  return SERVER_MATCH;
}

/**
 * Whether a media query matches, kept current. Through `useSyncExternalStore`,
 * so a component first mounted in the browser (a lazy interactive) reads the
 * real answer before rendering instead of replaying an entrance or arming an
 * autoplay the reader asked not to have.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
