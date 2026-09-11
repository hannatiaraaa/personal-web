import type { Metadata } from 'next';
import Link from 'next/link';
import { brandSentence, education, figures, identity, positioning, publications } from '@/content/facts';
import { PageHeader } from '@/components/page-header';
import { ContagionField } from '@/components/contagion-field';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How I got from frontend to the end of the pipeline: joined a fleet maintenance and procurement platform as a frontend engineer, picked up the API to own the approval rules end to end, then taught myself Playwright and built the release gate.',
};

const arc = [
  {
    period: '2021 – 2023',
    title: 'Frontend, then the whole mobile app',
    body: `Clinical software, remote from Indonesia to a Singapore team. I took a patient app that existed twice — once in Kotlin, once in Swift, quietly diverging — and unified it onto one React Native codebase. That is also where I learned that a security review is a design constraint, not a checklist: I closed ${figures.pentestFindingsClosed} of a penetration test's findings and wrote the client-side encryption library that keeps genetic data unreadable at rest. All of it hand-written; there were no coding assistants.`,
  },
  {
    period: '2024',
    title: 'Joined a product in its first months',
    body: 'Initialised the first codebases as a frontend engineer. The app went to crews at sea, which turns "offline support" from a feature into the premise — there is no slow connection to fall back on, there is no connection.',
  },
  {
    period: '2025',
    title: 'Picked up the API to take the rules end to end',
    body: `The approval rules could not be owned from the client. So I learned NestJS and MySQL and took them: multi-tier ladders, per-approver spending authority, price guards, cost-code mapping to a customer's chart of accounts. Most of what I know about the domain came from ${figures.escalations} escalations handled directly with operations, purchasing and finance staff — not from a backlog.`,
  },
  {
    period: '2026',
    title: 'Taught myself Playwright and built the gate',
    body: `A release nobody could certify was the constraint on everything else, so I built the thing that certifies it: ${figures.releaseCases} repeatable cases across ${figures.releaseSpecs} specs and ${figures.permissionChecks} authorization decisions per run, on throwaway databases with synthetic data. That gate is also why the AI-assisted work is fast — the acceptance criteria were written first, and the agent runs inside them.`,
  },
] as const;

export default function AboutPage() {
  return (
    <div className='space-y-16'>
      <PageHeader
        legend='About'
        title={brandSentence}
      />

      <section className='prose-page text-body text-ink-muted'>
        <p>
          I am {identity.name} — {identity.role} at {identity.employer}, {identity.employerParent}. The product is{' '}
          {positioning.product}, and it runs on {figures.vessels} vessels for {figures.realUsers} users across{' '}
          {figures.customerOrgs} large customer organisations, as {positioning.productSurfaces}.
        </p>
        <p>
          It is correctness-critical: approval ladders where a wrong total is a number someone signs, tax arithmetic
          that structurally cannot tax tax, multi-currency, multi-tenant isolation. And it is offline-critical, because
          the people using the app are why it has to work with no network at all.
        </p>
        <p>
          I was not hired for one layer. I kept following the problem into the next one because that is where the answer
          was — and I write the specification and the decision record first, because that is the only way the next
          person can argue with it.
        </p>
      </section>

      {/* The arc, because "full-stack" without a path through it is a claim
          rather than a history. */}
      <section aria-labelledby='arc'>
        <p className='legend'>The arc</p>
        <h2
          id='arc'
          className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
        >
          How the range was actually acquired
        </h2>
        <ol className='mt-8 space-y-4'>
          {arc.map((step) => (
            <li
              key={step.period}
              className='card reveal relative overflow-hidden p-5 sm:p-6'
            >
              <span
                aria-hidden='true'
                className='from-sky-high to-signal-cyan absolute inset-y-0 left-0 w-0.5 bg-linear-to-b'
              />
              <p className='tnum text-micro text-signal font-mono'>{step.period}</p>
              <h3 className='text-h3 text-ink mt-2 font-semibold tracking-[-0.015em]'>{step.title}</h3>
              <p className='prose-page text-meta text-ink-muted mt-2.5'>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby='maths'>
        <hr className='rule-fade' />
        <p className='legend mt-10'>Before software</p>
        <h2
          id='maths'
          className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
        >
          Mathematics, and the habit it left behind
        </h2>
        <p className='prose-page text-body text-ink-muted mt-4'>
          {education.degree}, {education.institution} ({education.years}), in {education.note}. {figures.publications}{' '}
          publication papers — one on classifying the likelihood of spreading hoaxes with a support vector machine, one
          an agent-based model of contagion effects in depression and recovery. It is not a credential I lean on, but it
          is where the habit comes from: find the rule underneath the thing that was reported, write it down, then check
          it.
        </p>
        <div className='mt-8'>
          <ContagionField />
        </div>

        <ul className='text-meta text-ink-muted mt-8 space-y-3'>
          {publications.map((paper) => (
            <li
              key={paper.title}
              className='flex gap-3'
            >
              <span
                aria-hidden='true'
                className='from-sky-high to-signal-cyan mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-br'
              />
              <span>
                {paper.title}. <span className='text-ink-faint'>{paper.venue}</span>, {paper.year}.
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby='remote'>
        <hr className='rule-fade' />
        <p className='legend mt-10'>Working style</p>
        <h2
          id='remote'
          className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
        >
          Remote, and written-first
        </h2>
        <p className='prose-page text-body text-ink-muted mt-4'>
          Remote since {identity.remoteSince}, across Indonesia, Singapore and outsourced teams. Working this way for{' '}
          {figures.yearsRemote} years has made the practice written-first by necessity: specifications, decision
          records, runbooks and release notes are how the work is handed over, not paperwork produced afterwards.
        </p>
        <p className='prose-page text-body text-ink-muted mt-4'>
          Based in {identity.location} ({identity.timezone}), {positioning.overlap}. {positioning.availability} in
          field-service, operations, HR/payroll or fintech software.
        </p>
        <div className='mt-6 flex flex-wrap items-center gap-x-6 gap-y-3'>
          <Link
            href='/cv'
            className='btn-primary group'
          >
            Read the full CV
            <ArrowIcon className='transition-transform group-hover:translate-x-0.5' />
          </Link>
          <a
            href={`mailto:${identity.email}`}
            className='text-meta text-ink-muted decoration-line-strong hover:text-ink underline underline-offset-4 transition-colors'
          >
            {identity.email}
          </a>
        </div>
      </section>
    </div>
  );
}
