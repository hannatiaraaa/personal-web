'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useState } from 'react';

const SETTLE_MS = 600;

/**
 * Text for a polite live region, published once input has settled — a slider
 * dragged through ten values is one announcement, not ten. Empty until
 * `isEnabled`, so nothing is read out before the reader has changed anything.
 */
export function useDebouncedAnnouncement(text: string, isEnabled: boolean): string {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    if (!isEnabled) return;
    const timer = window.setTimeout(() => setAnnounced(text), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [text, isEnabled]);

  return announced;
}
