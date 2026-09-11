/**
 * Inline SVG, replacing the FontAwesome kit script. The kit was a remote
 * third-party dependency keyed by an environment variable, which meant every
 * icon on the site could fail for two unrelated reasons.
 *
 * `currentColor` throughout so icons inherit the token colour of their context
 * and stay correct in both themes.
 */

type IconProps = {
  className?: string;
};

const base = 'h-[1em] w-[1em] shrink-0';

export function EmailIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <rect
        x='2.5'
        y='4.5'
        width='19'
        height='15'
        rx='2'
        stroke='currentColor'
        strokeWidth='1.6'
      />
      <path
        d='M3 6l9 6.5L21 6'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9.5h4v11H3v-11zM9.5 9.5h3.8v1.5h.06c.53-.95 1.82-1.85 3.74-1.85 4 0 4.4 2.45 4.4 5.64v5.71h-4v-5.06c0-1.27-.02-2.9-1.8-2.9-1.8 0-2.08 1.38-2.08 2.81v5.15h-4v-11z' />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0012 2z' />
    </svg>
  );
}

export function GitLabIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M12 21.5l3.2-9.85H8.8L12 21.5zM3.4 11.65l-1.22 3.76a.83.83 0 00.3.93L12 21.5 3.4 11.65zM3.4 11.65h5.4L6.48 4.5a.42.42 0 00-.8 0L3.4 11.65zM20.6 11.65l1.22 3.76a.83.83 0 01-.3.93L12 21.5l8.6-9.85zM20.6 11.65h-5.4l2.32-7.15a.42.42 0 01.8 0l2.28 7.15z' />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M5 12h13M13 6l6 6-6 6'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M12 3v11m0 0l-4-4m4 4l4-4M4 19h16'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <circle
        cx='12'
        cy='12'
        r='4.2'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ''}`}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
