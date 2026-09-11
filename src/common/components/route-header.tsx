'use client';

// Client because the layout cannot be told which child route rendered, and
// `usePathname` is the only thing that knows. It still renders on the server,
// so the h1 is in the HTML a crawler receives.

import { usePathname } from 'next/navigation';
import { getPageHeader } from '@/content/page-headers';
import { PageHeader } from './page-header';

/**
 * Renders the route's masthead, or nothing where a route supplies its own.
 *
 * Costs no additional JavaScript: `SiteHeader` already pulls `usePathname` into
 * the client bundle for its active-link state.
 */
export function RouteHeader() {
  const header = getPageHeader(usePathname());
  if (!header) return null;

  return (
    <PageHeader
      legend={header.legend}
      title={header.title}
      lead={header.lead}
    />
  );
}
