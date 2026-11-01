/**
 * A title turned into a valid element id. `aria-labelledby` splits its value on
 * spaces, so an id with whitespace leaves the element with no accessible name.
 * Anything deriving an id from prose goes through here.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
