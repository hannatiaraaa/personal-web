import type { Metadata } from 'next';
import '@/styles/globals.css';
import { mono, sans } from '@/lib/fonts';
import { identity, positioning } from '@/content/facts';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { themeInitScript } from '@/components/theme-toggle';

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
  address: { '@type': 'PostalAddress', addressLocality: 'Depok', addressCountry: 'ID' },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </head>
      <body className={`${sans.variable} ${mono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-line-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-meta focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
