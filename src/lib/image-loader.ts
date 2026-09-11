const host = process.env.NEXT_PUBLIC_STORAGE_HOST_NAME;
const path = process.env.NEXT_PUBLIC_STORAGE_PATH_NAME;
const options = process.env.NEXT_PUBLIC_ASSETS_OPTIONS;

type LoaderArgs = { src: string };

/**
 * Assets are hosted off-repo deliberately. When the host is not configured the
 * loader returns the path unchanged rather than building a URL out of
 * `undefined`, so a clean clone still builds and renders.
 */
export default function imageLoader({ src }: LoaderArgs): string {
  if (!host) return src;
  const query = options ? `?${options}` : '';
  return `https://${host}${path ?? ''}/${src}.svg${query}`;
}
