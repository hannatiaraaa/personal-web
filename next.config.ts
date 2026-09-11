import type { NextConfig } from 'next';

/**
 * Assets live off-repo behind an image loader (see src/lib/image-loader.ts).
 * Remote patterns are only registered when the host is configured, so a clean
 * clone with no .env.local still builds.
 */
const storageHost = process.env.NEXT_PUBLIC_STORAGE_HOST_NAME;
const storagePath = process.env.NEXT_PUBLIC_STORAGE_PATH_NAME;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: storageHost
    ? {
        loader: 'custom',
        loaderFile: './src/lib/image-loader.ts',
        remotePatterns: [{ protocol: 'https', hostname: storageHost, pathname: `${storagePath ?? ''}/**` }],
      }
    : {},
  async redirects() {
    return [
      // The 2023 site published these paths. Anyone holding a link keeps working.
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/projects/:slug', destination: '/work/:slug', permanent: true },
      { source: '/skills', destination: '/stack', permanent: true },
    ];
  },
};

export default nextConfig;
