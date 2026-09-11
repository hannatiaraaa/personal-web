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
      'I take the ambiguous version of the request, find the rule underneath it with the people who live it, write the specification, then build it.',
  },
  {
    term: 'Designed so the next change is configuration',
    detail: `Approval hierarchies, spending authority and charts of accounts are configured, not branched per customer. ${figures.customerOrgs} organisations run their own rules with no code change.`,
  },
  {
    term: 'Release quality as a system',
    detail: `${figures.releaseCases} deterministic cases and ${figures.permissionChecks} authorization decisions per run, with inherited debt quarantined by name so it cannot count as a pass.`,
  },
] as const;

export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      {/* Masthead. The sky sits behind it as one painted layer — no image, no
          script, and nothing that composites while the page scrolls. */}
      <section className='relative isolate'>
        <div
          aria-hidden='true'
          className='sky-field'
        />

        <p className='legend'>
          {identity.brandLine} · {identity.location} · {identity.timezone}
        </p>

        <h1 className='text-display text-ink mt-5 font-semibold tracking-[-0.04em] text-balance'>{identity.name}</h1>

        <p className='text-lead text-ink mt-6 max-w-3xl text-pretty'>{brandSentence}</p>

        <p className='text-body text-ink-muted mt-5 max-w-2xl'>
          I build <span className='text-ink font-medium'>{positioning.domain}</span> for fleet operations —{' '}
          {positioning.surfaces.join(', ')}. Most of my code is the offline app crews use at sea, where there is no
          network to fall back on.
        </p>

        <div className='mt-10'>
          <FigureRow figures={headlineFigures} />
        </div>

        <div className='mt-8 flex flex-wrap items-center gap-x-5 gap-y-4'>
          <Link
            href='/work'
            className='btn-primary group'
          >
            Read the case studies
            <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
          </Link>
          <a
            href={`mailto:${identity.email}`}
            className='btn-quiet'
          >
            {identity.email}
          </a>
        </div>

        <p className='text-micro text-ink-faint mt-5 font-mono'>
          {positioning.availability} · {positioning.overlap}
        </p>
      </section>

      <hr className='rule-fade' />

      {/* Four of the six, as cards. The reported quote is the hook on each. */}
      <section aria-labelledby='problems'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='legend'>Selected work</p>
            <h2
              id='problems'
              className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
            >
              What the problem turned out to be
            </h2>
          </div>
          <Link
            href='/work'
            className='group text-micro text-ink-muted hover:text-signal flex items-center gap-1.5 font-mono uppercase transition-colors'
          >
            All {caseStudies.length}
            <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
          </Link>
        </div>

        <div className='mt-8 grid gap-4 sm:grid-cols-2'>
          {caseStudies.slice(0, 4).map((study, index) => (
            <CaseStudyCard
              key={study.slug}
              study={study}
              index={index}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby='practice'>
        <p className='legend'>Practice</p>
        <h2
          id='practice'
          className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
        >
          How I work
        </h2>

        <dl className='mt-8 grid gap-4 sm:grid-cols-3'>
          {practice.map(({ term, detail }) => (
            <div
              key={term}
              className='card reveal p-5 sm:p-6'
            >
              <dt className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{term}</dt>
              <dd className='text-meta text-ink-muted mt-2.5'>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The mathematics is a real part of how I work, so it gets a door rather
          than a mention. */}
      <section
        aria-labelledby='maths'
        className='card reveal from-signal-wash to-surface overflow-hidden bg-linear-to-br p-6 sm:p-8'
      >
        <p className='legend'>Before software</p>
        <h2
          id='maths'
          className='text-h2 text-ink mt-3 max-w-2xl font-semibold tracking-[-0.025em]'
        >
          Applied mathematics, and the habit it left behind
        </h2>
        <p className='text-body text-ink-muted mt-4 max-w-2xl'>
          {education.degree}, {education.institution}. One of my two published papers is an agent-based contagion model.
          It runs live on the about page, because a model you can move is a better argument than a citation.
        </p>
        <Link
          href='/about'
          className='btn-quiet group mt-6'
        >
          Run the model
          <ArrowIcon className='transition-transform duration-300 group-hover:translate-x-1' />
        </Link>
      </section>
    </div>
  );
}
