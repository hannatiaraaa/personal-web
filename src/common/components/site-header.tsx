'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { identity } from '@/content/facts';
import { ThemeToggle } from './theme-toggle';
import { GitHubIcon } from './icons';

const routes = [
  { href: '/work', label: 'Work' },
  { href: '/stack', label: 'Stack' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className='border-line bg-bg/70 sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150'>
      <div className='mx-auto flex h-14 max-w-5xl items-center gap-3 px-5 sm:gap-6 sm:px-8'>
        <Link
          href='/'
          aria-label={`${identity.name} — home`}
          className='text-meta text-ink font-mono font-semibold tracking-[0.14em] uppercase'
        >
          Hanna<span className='signal-text'>.</span>
        </Link>

        <nav
          aria-label='Main'
          className='flex flex-1 items-center gap-0.5 sm:gap-1'
        >
          {routes.map((route) => {
            const active = pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? 'page' : undefined}
                className={`text-meta rounded-md px-2 py-1.5 transition-colors sm:px-2.5 ${
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {route.label}
                {/* Active state is an underline as well as a colour, so it does
                    not rely on colour alone. */}
                {active && (
                  <span
                    aria-hidden='true'
                    className='from-sky-high to-signal-cyan mt-0.5 block h-0.5 rounded-full bg-linear-to-r'
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className='flex items-center gap-2'>
          <a
            href={identity.github}
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub profile (opens in a new tab)'
            className='border-line text-ink-muted hover:border-line-strong hover:text-ink hidden h-9 w-9 items-center justify-center rounded-md border text-[1.05rem] transition-colors sm:flex'
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
