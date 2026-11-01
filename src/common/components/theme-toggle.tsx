'use client';

// Client because the toggle writes the theme to the document and storage.

import { useTheme } from '@/common/hooks/use-theme';
import { THEME_STORAGE_KEY } from '@/common/lib/theme';
import { MoonIcon, SunIcon } from './icons';

/** Runs before paint, so the page never renders in the wrong theme first. */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();
`;

/**
 * Both icons are always rendered, and CSS decides which one shows from the
 * theme in effect (`.theme-toggle-icon` in globals.css) — so the right icon is
 * there before hydration, and a switch cross-fades them instead of swapping.
 */
type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { theme, toggle } = useTheme();

  // Until the effect has run the rendered theme is unknown, so the control
  // renders without a state claim rather than announcing a wrong one.
  const label = theme === null ? 'Switch theme' : theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`icon-btn ${className ?? ''}`}
    >
      <span
        aria-hidden='true'
        className='theme-toggle-icons'
      >
        <MoonIcon className='theme-toggle-icon theme-toggle-moon' />
        <SunIcon className='theme-toggle-icon theme-toggle-sun' />
      </span>
    </button>
  );
}
