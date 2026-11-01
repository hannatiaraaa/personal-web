'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useState } from 'react';

/**
 * Whether the tab is foregrounded. Paired with `useInViewport`: a visual that is
 * scrolled into view in a background tab still must not run.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    onChange();

    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
