'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useState, type RefObject } from 'react';

const ROOT_MARGIN = '160px';

/**
 * Whether the referenced element is on screen. Every animation is gated on it;
 * the margin starts work just before the element arrives.
 */
export function useInViewport(ref: RefObject<Element | null>, rootMargin: string = ROOT_MARGIN): boolean {
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInViewport(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inViewport;
}
