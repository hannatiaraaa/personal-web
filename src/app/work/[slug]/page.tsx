import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { caseStudies, getCaseStudy } from '@/content/case-studies';
import { FigureRow } from '@/components/figure-row';
import { CaseStudyDiagram } from '@/components/diagrams';
import { ArrowIcon } from '@/components/icons';

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

/** The four parts, in the order the work actually happened. */
function Part({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <section className='reveal'>
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='from-sky-high to-signal-cyan h-3 w-0.5 rounded-full bg-linear-to-b'
        />
        <p className='legend'>{legend}</p>
      </div>
      <div className='prose-page text-body text-ink-muted mt-5'>{children}</div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((item) => item.slug === slug);
  const next = caseStudies.at((index + 1) % caseStudies.length);

  return (
    <article className='space-y-12'>
      <header>
        <Link
          href='/work'
          className='text-micro text-ink-muted hover:text-signal font-mono uppercase transition-colors'
        >
          ← All work
        </Link>
        <p className='legend mt-6'>
          {study.context} · {study.period}
        </p>
        <h1 className='text-h1 text-ink mt-3 max-w-3xl font-semibold tracking-[-0.02em] text-balance'>{study.title}</h1>
        <p className='text-lead text-ink-muted mt-4 max-w-2xl'>{study.summary}</p>
      </header>

      {/* Reported gets its own visual weight — it is the claim the rest of the
          page argues with. */}
      <section className='card from-signal-wash to-surface overflow-hidden bg-linear-to-br p-6 sm:p-7'>
        <p className='legend'>How it was reported</p>
        <blockquote className='text-lead text-ink mt-3 text-pretty'>&ldquo;{study.reported}&rdquo;</blockquote>
      </section>

      <Part legend='What it actually was'>
        {study.actually.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        {study.diagram && <CaseStudyDiagram kind={study.diagram} />}
      </Part>

      <Part legend='What shipped'>
        <ul className='space-y-3'>
          {study.shipped.map((item) => (
            <li
              key={item.slice(0, 40)}
              className='flex gap-3'
            >
              <span
                aria-hidden='true'
                className='from-sky-high to-signal-cyan mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-br'
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Part>

      <Part legend='Evidence'>
        <FigureRow
          figures={study.evidence}
          variant='inline'
        />
        {study.evidenceNote && <p className='mt-6'>{study.evidenceNote}</p>}
        <ul className='mt-7 flex flex-wrap gap-2'>
          {study.stack.map((item) => (
            <li
              key={item}
              className='chip text-micro'
            >
              {item}
            </li>
          ))}
        </ul>
      </Part>

      {next && (
        <nav aria-label='Next case study'>
          <Link
            href={`/work/${next.slug}`}
            className='card card-interactive group block p-5 sm:p-6'
          >
            <p className='legend'>Next</p>
            <p className='text-h3 text-ink mt-2.5 flex items-baseline justify-between gap-4 font-semibold tracking-[-0.015em]'>
              <span>{next.title}</span>
              <ArrowIcon className='text-signal shrink-0 transition-transform duration-300 group-hover:translate-x-1' />
            </p>
          </Link>
        </nav>
      )}
    </article>
  );
}
