import Link from 'next/link';
import { identity } from '@/content/facts';
import { GitHubIcon } from './icons';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { ThemeToggle } from './theme-toggle';

/**
 * The bar from `sm` up; below it the links and the toggle fold into a menu, as
 * four 44px links, the toggle and the name do not fit a 320px phone.
 */
export function SiteHeader() {
  return (
    <header className='border-line bg-bg/70 sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150'>
      <div className='mx-auto flex h-14 max-w-5xl items-center gap-2 px-5 sm:gap-6 sm:px-8'>
        <Link
          href='/'
          aria-label={`${identity.name} — home`}
          className='text-meta text-ink inline-flex items-center font-mono font-semibold tracking-[0.14em] uppercase pointer-coarse:min-h-11'
        >
          Hanna<span className='signal-text'>.</span>
        </Link>

        <nav
          aria-label='Main'
          className='hidden flex-1 items-center sm:flex sm:gap-1'
        >
          <NavLinks variant='bar' />
        </nav>

        <div className='hidden items-center gap-2 sm:flex'>
          <a
            href={identity.github}
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub profile (opens in a new tab)'
            className='icon-btn'
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>

        <MobileMenu />
      </div>
      {/* Reading progress. Decorative and CSS-only; see .reading-rail. */}
      <div
        aria-hidden='true'
        className='reading-rail'
      />
    </header>
  );
}
