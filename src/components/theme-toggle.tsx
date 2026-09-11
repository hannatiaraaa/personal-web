'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

type Theme = 'light' | 'dark';

/** Runs before paint, so the page never renders in the wrong theme first. */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();
`;

function resolveTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  function toggle() {
    const next: Theme = resolveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Private browsing. The choice holds for this page view and is not persisted.
    }
    setTheme(next);
  }

  // Until the effect has run the rendered theme is unknown, so the control
  // renders without a state claim rather than announcing a wrong one.
  const label = theme === null ? 'Switch theme' : theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={label}
      title={label}
      className='border-line text-ink-muted hover:border-line-strong hover:text-ink flex h-9 w-9 items-center justify-center rounded-md border text-[1.05rem] transition-colors'
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
