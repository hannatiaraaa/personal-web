import type { MetadataRoute } from 'next';
import { identity } from '@/content/facts';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${identity.site}/sitemap.xml`,
  };
}
