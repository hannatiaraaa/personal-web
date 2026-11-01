'use client';

// Client: the current page's link is marked from the pathname.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveRoute, SITE_ROUTES } from '@/common/lib/site-routes';

type Props = {
  /** A row in the header bar, or a stacked list in the small-screen menu. */
  variant: 'bar' | 'menu';
};

const LINK_CLASS = {
  bar: 'text-meta group inline-flex items-center justify-center rounded-md px-1 py-1.5 transition-colors sm:px-2.5 pointer-coarse:min-h-11 pointer-coarse:min-w-11',
  menu: 'text-body group flex min-h-11 items-center rounded-md px-3 transition-colors',
} as const;

export function NavLinks({ variant }: Props) {
  const pathname = usePathname();

  return SITE_ROUTES.map((route) => {
    const active = isActiveRoute(pathname, route.href);
    return (
      <Link
        key={route.href}
        href={route.href}
        aria-current={active ? 'page' : undefined}
        className={`${LINK_CLASS[variant]} ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}
      >
        <span className='relative'>
          {route.label}
          {/* An underline as well as a colour, so the active state does
              not rely on colour alone. Always rendered so it can draw in. */}
          <span
            aria-hidden='true'
            className={`from-sky-high to-signal-cyan absolute inset-x-0 -bottom-1 h-0.5 origin-left rounded-full bg-linear-to-r transition-[scale,opacity] duration-200 ${
              active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40'
            }`}
          />
        </span>
      </Link>
    );
  });
}
