'use client';

import { useEffect, useState, type RefObject } from 'react';

const ROOT_MARGIN = '160px';

/**
 * Whether the referenced element is on screen.
 *
 * Every animation in this repo is gated on this: a loop that runs while nobody
 * is looking is a bug, not a feature. The margin starts work slightly before
 * the element arrives so it is already drawing when it does.
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
