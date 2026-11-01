'use client';

// Client: the menu opens and closes on a button, and closes on Escape, an
// outside press and a route change.

import { useId } from 'react';
import { usePathname } from 'next/navigation';
import { useDisclosure } from '@/common/hooks/use-disclosure';
import { CloseIcon, MenuIcon } from './icons';
import { NavLinks } from './nav-links';
import { ThemeToggle } from './theme-toggle';

/**
 * The header's links and theme toggle, behind one button, where the bar is
 * too narrow to hold them. The panel overlays the page below the header, so
 * opening it moves nothing.
 */
export function MobileMenu() {
  const panelId = useId();
  const { isOpen, toggle, triggerRef, panelRef } = useDisclosure<HTMLButtonElement, HTMLDivElement>(usePathname());

  return (
    <div className='ml-auto sm:hidden'>
      <button
        ref={triggerRef}
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label='Menu'
        className='icon-btn menu-btn size-11'
      >
        <span
          aria-hidden='true'
          className='menu-btn-icons'
        >
          <MenuIcon className='menu-btn-icon menu-btn-open' />
          <CloseIcon className='menu-btn-icon menu-btn-close' />
        </span>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!isOpen}
        className='mobile-menu border-line bg-bg absolute inset-x-0 top-full border-b'
      >
        <div className='mx-auto max-w-5xl px-5 pt-2 pb-4'>
          <nav
            aria-label='Main'
            className='flex flex-col'
          >
            <NavLinks variant='menu' />
          </nav>
          <div className='border-line mt-2 flex items-center justify-between border-t pt-3 pl-3'>
            <span className='text-meta text-ink-muted'>Theme</span>
            <ThemeToggle className='size-11' />
          </div>
        </div>
      </div>
    </div>
  );
}
