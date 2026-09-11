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
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-5 sm:gap-6 sm:px-8">
        <Link
          href="/"
          aria-label={`${identity.name} — home`}
          className="font-mono text-meta font-semibold tracking-[0.14em] text-ink uppercase"
        >
          Hanna<span className="text-signal">.</span>
        </Link>

        <nav aria-label="Main" className="flex flex-1 items-center gap-0.5 sm:gap-1">
          {routes.map((route) => {
            const active = pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-2 py-1.5 text-meta transition-colors sm:px-2.5 ${
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {route.label}
                {/* Active state is an underline as well as a colour, so it does
                    not rely on colour alone. */}
                {active && <span aria-hidden="true" className="mt-0.5 block h-px bg-signal" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in a new tab)"
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-line text-[1.05rem] text-ink-muted transition-colors hover:border-line-strong hover:text-ink sm:flex"
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
