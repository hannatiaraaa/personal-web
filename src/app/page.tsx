import Link from 'next/link';
import { brandSentence, education, figures, headlineFigures, identity, positioning } from '@/content/facts';
import { caseStudies } from '@/content/case-studies';
import { FigureRow } from '@/components/figure-row';
import { CaseStudyCard } from '@/components/case-study-card';
import { ArrowIcon } from '@/components/icons';

const practice = [
  {
    term: 'Problem framing before code',
    detail:
      'I take the ambiguous version of the request, find the rule underneath it with the people who live it, write the specification and the decision record, and then build it.',
  },
  {
    term: 'Designed so the next change is configuration',
    detail: `Approval hierarchies, spending authority and charts of accounts are configured, not branched per customer. ${figures.customerOrgs} customer organisations run their own rules with no code change.`,
  },
  {
    term: 'Release quality as a system',
    detail: `${figures.releaseCases} deterministic cases and ${figures.permissionChecks} frozen authorization decisions per run, with inherited debt quarantined by name so it cannot be counted as a pass.`,
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-20 sm:space-y-24">
      {/* Masthead. The sky sits behind it as one painted layer — no image, no
          script, and nothing that composites while the page scrolls. */}
      <section className="relative isolate">
        <div aria-hidden="true" className="sky-field" />

        <p className="legend">
          {identity.brandLine} · {identity.location} · {identity.timezone}
        </p>

        <h1 className="mt-5 text-balance text-display font-semibold tracking-[-0.04em] text-ink">
          {identity.name}
        </h1>

        <p className="mt-6 max-w-3xl text-pretty text-lead text-ink">{brandSentence}</p>

        <p className="mt-5 max-w-2xl text-body text-ink-muted">
          I build <span className="font-medium text-ink">{positioning.domain}</span>:{' '}
          {positioning.surfaces.join(', ')}. Most of my code is the offline-first app that frontline crews use where
          there is no network — proved on {positioning.proof}, where connectivity is genuinely absent rather than slow.
        </p>

        <div className="mt-10">
          <FigureRow figures={headlineFigures} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
          <Link href="/work" className="btn-primary group">
            Read the case studies
            <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a href={`mailto:${identity.email}`} className="btn-quiet">
            {identity.email}
          </a>
        </div>

        <p className="mt-5 font-mono text-micro text-ink-faint">
          {positioning.availability} · {positioning.overlap}
        </p>
      </section>

      <hr className="rule-fade" />

      {/* Four of the six, as cards. The reported quote is the hook on each. */}
      <section aria-labelledby="problems">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="legend">Selected work</p>
            <h2 id="problems" className="mt-3 text-h2 font-semibold tracking-[-0.025em] text-ink">
              What the problem turned out to be
            </h2>
          </div>
          <Link
            href="/work"
            className="group flex items-center gap-1.5 font-mono text-micro text-ink-muted uppercase transition-colors hover:text-signal"
          >
            All {caseStudies.length}
            <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {caseStudies.slice(0, 4).map((study, index) => (
            <CaseStudyCard key={study.slug} study={study} index={index} />
          ))}
        </div>
      </section>

      <section aria-labelledby="practice">
        <p className="legend">Practice</p>
        <h2 id="practice" className="mt-3 text-h2 font-semibold tracking-[-0.025em] text-ink">
          How I work
        </h2>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {practice.map(({ term, detail }) => (
            <div key={term} className="card reveal p-5 sm:p-6">
              <dt className="text-h3 font-semibold tracking-[-0.015em] text-ink">{term}</dt>
              <dd className="mt-2.5 text-meta text-ink-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The mathematics is a real part of how I work, so it gets a door rather
          than a mention. */}
      <section
        aria-labelledby="maths"
        className="card reveal overflow-hidden bg-linear-to-br from-signal-wash to-surface p-6 sm:p-8"
      >
        <p className="legend">Before software</p>
        <h2 id="maths" className="mt-3 max-w-2xl text-h2 font-semibold tracking-[-0.025em] text-ink">
          Applied mathematics, and the habit it left behind
        </h2>
        <p className="mt-4 max-w-2xl text-body text-ink-muted">
          {education.degree}, {education.institution}. {figures.publications.charAt(0).toUpperCase() + figures.publications.slice(1)}{' '}
          peer-reviewed papers, one of them an agent-based contagion model — it runs live on the about page, because a
          model you can move is a better argument than a citation.
        </p>
        <Link href="/about" className="btn-quiet group mt-6">
          Run the model
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}
