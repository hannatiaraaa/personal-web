import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { caseStudies, getCaseStudy } from '@/content/case-studies';
import {
  CaseStudyHeader,
  Evidence,
  nextCaseStudy,
  NextCaseStudy,
  ReportedQuote,
  WhatActuallyWas,
  WhatShipped,
} from '@/modules/work';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};

  return {
    title: study.title,
    description: study.summary,
    openGraph: { title: study.title, description: study.summary, type: 'article' },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const next = nextCaseStudy(slug);

  return (
    <article className='space-y-12'>
      <CaseStudyHeader study={study} />
      <ReportedQuote reported={study.reported} />
      <WhatActuallyWas study={study} />
      <WhatShipped study={study} />
      <Evidence study={study} />
      {next && <NextCaseStudy study={next} />}
    </article>
  );
}
