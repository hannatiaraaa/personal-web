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
    <section className="border-t border-line pt-7">
      <p className="legend">{legend}</p>
      <div className="prose-page mt-4 text-body text-ink-muted">{children}</div>
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
    <article className="space-y-10">
      <header>
        <Link
          href="/work"
          className="font-mono text-micro text-ink-muted transition-colors hover:text-ink"
        >
          ← ALL WORK
        </Link>
        <p className="legend mt-6">
          {study.context} · {study.period}
        </p>
        <h1 className="mt-3 max-w-3xl text-balance text-h1 font-semibold tracking-[-0.02em] text-ink">
          {study.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lead text-ink-muted">{study.summary}</p>
      </header>

      {/* Reported gets its own visual weight — it is the claim the rest of the
          page argues with. */}
      <section className="rounded-lg border border-line bg-surface-sunk p-5 sm:p-6">
        <p className="legend">How it was reported</p>
        <blockquote className="mt-3 text-lead text-ink">&ldquo;{study.reported}&rdquo;</blockquote>
      </section>

      <Part legend="What it actually was">
        {study.actually.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        {study.diagram && <CaseStudyDiagram kind={study.diagram} />}
      </Part>

      <Part legend="What shipped">
        <ul className="space-y-3">
          {study.shipped.map((item) => (
            <li key={item.slice(0, 40)} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.6em] h-1 w-3 shrink-0 bg-signal" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Part>

      <Part legend="Evidence">
        <FigureRow figures={study.evidence} variant="inline" />
        {study.evidenceNote && <p className="mt-6">{study.evidenceNote}</p>}
        <p className="mt-6 font-mono text-micro text-ink-faint">{study.stack.join(' · ')}</p>
      </Part>

      {next && (
      <nav aria-label="Next case study" className="border-t border-line pt-7">
        <Link href={`/work/${next.slug}`} className="group block">
          <p className="legend">Next</p>
          <p className="mt-2 flex items-baseline gap-2 text-h3 font-semibold text-ink">
            <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-signal">
              {next.title}
            </span>
            <ArrowIcon className="shrink-0 text-signal opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        </Link>
      </nav>
      )}
    </article>
  );
}
