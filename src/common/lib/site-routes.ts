/** The routes the header links to, in reading order. */
export const SITE_ROUTES = [
  { href: '/work', label: 'Work' },
  { href: '/stack', label: 'Stack' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
] as const;

/** Whether a route is the page being read, or a page inside it (a case study is in Work). */
export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
