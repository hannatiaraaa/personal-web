/**
 * A title turned into something that can be an element id.
 *
 * HTML ids must not contain whitespace, and `aria-labelledby` parses its value
 * as a space-separated list of ids — so `id="Reach for daily"` silently became
 * three lookups that resolved to nothing, and the section had no accessible
 * name at all. Anything deriving an id from prose goes through here.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
