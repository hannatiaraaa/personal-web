'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether the element has come within `rootMargin` of the screen, latched once
 * true: a placeholder swapped for a live piece must not unmount what the reader
 * has set when they scroll away.
 */
export function useLatchedInViewport(ref: RefObject<Element | null>, rootMargin: string): boolean {
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasArrived) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setHasArrived(true);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, hasArrived]);

  return hasArrived;
}
