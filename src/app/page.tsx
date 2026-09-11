import Link from 'next/link';
import { brandSentence, figures, headlineFigures, identity, positioning } from '@/content/facts';
import { caseStudies } from '@/content/case-studies';
import { FigureRow } from '@/components/figure-row';
import { ArrowIcon } from '@/components/icons';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Masthead. Left-aligned spec sheet, not a centred hero — the claim, the
          proof and the constraint, all above the fold. */}
      <section>
        <p className="legend">
          {identity.brandLine} · {identity.location} · {identity.timezone}
        </p>

        <h1 className="mt-4 text-balance text-display font-semibold tracking-[-0.03em] text-ink">
          {identity.name}
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-lead text-ink">{brandSentence}</p>

        <p className="mt-4 max-w-2xl text-body text-ink-muted">
          I build {positioning.domain}: {positioning.surfaces.join(', ')}. Most of my code is the offline-first app
          that frontline crews use where there is no network — proved on {positioning.proof}, where connectivity is
          genuinely absent rather than slow.
        </p>

        <div className="mt-8">
          <FigureRow figures={headlineFigures} />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/work"
            className="group flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-meta font-medium text-bg transition-opacity hover:opacity-90"
          >
            Read the case studies
            <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={`mailto:${identity.email}`}
            className="text-meta text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
          >
            {identity.email}
          </a>
          <span className="font-mono text-micro text-ink-faint">
            {positioning.availability} · {positioning.overlap}
          </span>
        </div>
      </section>

      {/* The four problems. Reported line first, because the divergence between
          what was reported and what it turned out to be is the whole pitch. */}
      <section aria-labelledby="problems">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h2 id="problems" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
            What the problem turned out to be
          </h2>
          <Link
            href="/work"
            className="shrink-0 font-mono text-micro text-ink-muted transition-colors hover:text-ink"
          >
            ALL {caseStudies.length}
          </Link>
        </div>

        <ul className="divide-y divide-line">
          {caseStudies.slice(0, 4).map((study) => (
            <li key={study.slug}>
              <Link href={`/work/${study.slug}`} className="group block py-6">
                <p className="font-mono text-meta text-ink-faint">
                  Reported: <span className="text-ink-muted">&ldquo;{study.reported}&rdquo;</span>
                </p>
                <h3 className="mt-2 flex items-baseline gap-2 text-h3 font-semibold text-ink">
                  <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-signal">
                    {study.title}
                  </span>
                  <ArrowIcon className="shrink-0 text-signal opacity-0 transition-opacity group-hover:opacity-100" />
                </h3>
                <p className="mt-2 max-w-2xl text-meta text-ink-muted">{study.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How the work is run. The third thing a hiring manager wants after
          "what" and "how much" — and the part that is genuinely scarce. */}
      <section aria-labelledby="how" className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <h2 id="how" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
          How I work
        </h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
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
          ].map(({ term, detail }) => (
            <div key={term}>
              <dt className="text-h3 font-semibold text-ink">{term}</dt>
              <dd className="mt-2 text-meta text-ink-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
