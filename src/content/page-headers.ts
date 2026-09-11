import { brandSentence, identity } from './facts';

/**
 * The masthead each route opens with, keyed by its path.
 *
 * Four routes were repeating the same component with the same shape of props,
 * which made the header a page concern when it is a layout one. It is declared
 * here once and rendered by the layout; a page composes only what is below it.
 *
 * A route with no entry gets no header. That is deliberate for `/`, which opens
 * with the pool, and for a case study, which has its own header carrying the
 * context and period.
 */
export type PageHeaderContent = {
  readonly legend: string;
  readonly title: string;
  readonly lead?: string;
};

export const pageHeaders: Readonly<Record<string, PageHeaderContent>> = {
  '/work': {
    legend: 'Selected work',
    title: 'Each of these is one problem that turned out to be something else',
    lead: 'The reported version of a problem is rarely the problem. Each one here is written from the report down to the mechanism that closed it.',
  },
  '/stack': {
    legend: 'Stack',
    title: 'Grouped by what I would reach for on Monday',
    lead: 'A flat alphabetical list cannot tell you what someone uses from what they once touched. These are ordered by how current they are, and the domain group is the one that takes longest to learn.',
  },
  '/about': {
    legend: 'About',
    title: brandSentence,
  },
  '/cv': {
    legend: `${identity.brandLine} · ${identity.stackLine}`,
    title: identity.name,
    lead: `${identity.location} (${identity.timezone}) · remote since ${identity.remoteSince}, seeking full-remote · ${identity.email}`,
  },
};

/** Trailing slashes and casing should not decide whether a page has a header. */
export function getPageHeader(pathname: string): PageHeaderContent | null {
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, '').toLowerCase() : pathname;
  return pageHeaders[normalised] ?? null;
}
