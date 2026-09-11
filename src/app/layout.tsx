import type { Metadata } from 'next';
import '@/styles/globals.css';
import { mono, sans } from '@/common/lib/fonts';
import { identity, positioning } from '@/content/facts';
import { RouteHeader } from '@/common/components/route-header';
import { SiteHeader } from '@/common/components/site-header';
import { SiteFooter } from '@/common/components/site-footer';
import { themeInitScript } from '@/common/components/theme-toggle';

const description = `${identity.brandLine} building ${positioning.domain} — offline-first mobile for field crews, approval and procure-to-pay workflows, and the release gate that decides what ships.`;

export const metadata: Metadata = {
  metadataBase: new URL(identity.site),
  title: {
    default: `${identity.name} — ${identity.brandLine}`,
    template: `%s · ${identity.name}`,
  },
  description,
  authors: [{ name: identity.name, url: identity.site }],
  keywords: [
    'full-stack engineer',
    'offline-first',
    'React Native',
    'Expo',
    'Next.js',
    'NestJS',
    'TypeScript',
    'field operations software',
    'procure-to-pay',
    'approval workflows',
    'release automation',
    'remote engineer',
  ],
  openGraph: {
    type: 'profile',
    siteName: identity.name,
    title: `${identity.name} — ${identity.brandLine}`,
    description,
    url: identity.site,
    locale: 'en',
  },
  twitter: { card: 'summary_large_image', title: identity.name, description },
  alternates: { canonical: identity.site },
  robots: { index: true, follow: true },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: identity.name,
  jobTitle: identity.brandLine,
  url: identity.site,
  email: `mailto:${identity.email}`,
  sameAs: [identity.linkedin, identity.github],
  address: { '@type': 'PostalAddress', addressLocality: 'Jakarta / West Java', addressCountry: 'ID' },
  worksFor: { '@type': 'Organization', name: identity.employer },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universitas Indonesia' },
  knowsAbout: [
    'Offline-first architecture',
    'React Native',
    'Next.js',
    'NestJS',
    'Procure-to-pay',
    'Approval workflows',
    'Release automation',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable}`}>
        <a
          href='#main'
          className='focus:border-line-strong focus:bg-surface focus:text-meta focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:px-4 focus:py-2'
        >
          Skip to content
        </a>
        <SiteHeader />
        <main
          id='main'
          className='mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16'
        >
          {/* The gap only exists when a route has a header; with one child the
              space-y has nothing to sit between. */}
          <div className='space-y-16'>
            <RouteHeader />
            {children}
          </div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
