import type { MetadataRoute } from 'next';
import { identity } from '@/content/facts';
import { caseStudies } from '@/content/case-studies';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/work', '/stack', '/about', '/cv'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${identity.site}${route}`,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...caseStudies.map((study) => ({
      url: `${identity.site}/work/${study.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
