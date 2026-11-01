'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useEffect, useState } from 'react';
import { DARK_SCHEME_QUERY, REDUCED_MOTION_QUERY } from '@/common/lib/media-queries';
import { THEME_STORAGE_KEY } from '@/common/lib/theme';

export type Theme = 'light' | 'dark';

const SWITCHING_ATTRIBUTE = 'data-theme-switching';

function resolveTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private browsing. The choice holds for this page view and is not persisted.
  }
}

/**
 * The theme in effect, and a switch between the two. `null` until the effect
 * runs: the server cannot know it, and naming the wrong state is worse than none.
 *
 * The switch cross-fades the page through View Transitions where available
 * (instant otherwise, or under reduced motion), with per-element colour
 * transitions held off (`data-theme-switching` in globals.css) so the page
 * never changes colour piece by piece.
 */
export function useTheme(): { theme: Theme | null; toggle: () => void } {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = resolveTheme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    root.setAttribute(SWITCHING_ATTRIBUTE, '');
    const release = () => root.removeAttribute(SWITCHING_ATTRIBUTE);

    if (!isReduced && typeof document.startViewTransition === 'function') {
      const transition = document.startViewTransition(() => applyTheme(next));
      transition.finished.then(release, release);
    } else {
      applyTheme(next);
      // One frame for the new colours to be computed with transitions off.
      requestAnimationFrame(() => requestAnimationFrame(release));
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
