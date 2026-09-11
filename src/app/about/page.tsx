import type { Metadata } from 'next';
import Link from 'next/link';
import { brandSentence, education, figures, identity, positioning, publications } from '@/content/facts';
import { PageHeader } from '@/components/page-header';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How I got from frontend to the end of the pipeline: joined a field-operations platform as a frontend engineer, picked up the API to take the approval rules end to end, then taught myself Playwright and built the release gate.',
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
    body: 'Initialised the first codebases as a frontend engineer on a field-operations platform. The app went to crews working at sea, which turns "offline support" from a feature into the premise — there is no slow connection to fall back on, there is no connection.',
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
    <div className="space-y-14">
      <PageHeader legend="About" title={brandSentence} />

      <section className="prose-page text-body text-ink-muted">
        <p>
          I am {identity.name} — {identity.role} at {identity.employer}, {identity.employerParent}. I work on{' '}
          {positioning.domain}, and the products I have built run on {figures.vessels} vessels across{' '}
          {figures.customerOrgs} customer organisations.
        </p>
        <p>
          The work is correctness-critical in a specific way: approval ladders where a wrong total is a number someone
          signs, tax arithmetic that structurally cannot tax tax, multi-currency, and multi-tenant isolation. And it is
          offline-critical in another — the people using the app are the reason it has to work with no network at all.
        </p>
        <p>
          I am not a specialist who was hired for one layer. I am someone who kept following the problem into the next
          layer because that was where the answer was, and who writes the specification and the decision record before
          the code because that is the only way the next person can argue with it.
        </p>
      </section>

      {/* The arc, because "full-stack" without a path through it is a claim
          rather than a history. */}
      <section aria-labelledby="arc">
        <h2 id="arc" className="border-b border-line pb-4 text-h2 font-semibold tracking-[-0.02em] text-ink">
          How the range was actually acquired
        </h2>
        <ol className="mt-2">
          {arc.map((step) => (
            <li key={step.period} className="border-b border-line py-6 last:border-0">
              <p className="tnum font-mono text-micro text-ink-faint">{step.period}</p>
              <h3 className="mt-2 text-h3 font-semibold text-ink">{step.title}</h3>
              <p className="prose-page mt-2 text-meta text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="maths" className="border-t border-line pt-8">
        <h2 id="maths" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
          Before software, mathematics
        </h2>
        <p className="prose-page mt-4 text-body text-ink-muted">
          {education.degree}, {education.institution} ({education.years}), in {education.note}. {figures.publications}{' '}
          peer-reviewed papers — one on classifying the likelihood of spreading hoaxes with a support vector machine,
          one an agent-based model of contagion effects in depression and recovery. It is not a credential I lean on,
          but it is where the habit comes from: find the rule underneath the thing that was reported, write it down,
          then check it.
        </p>
        <ul className="mt-5 space-y-3 text-meta text-ink-muted">
          {publications.map((paper) => (
            <li key={paper.title}>
              {paper.title}. <span className="text-ink-faint">{paper.venue}</span>, {paper.year}.
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="remote" className="border-t border-line pt-8">
        <h2 id="remote" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
          Remote, and written-first
        </h2>
        <p className="prose-page mt-4 text-body text-ink-muted">
          Remote since {identity.remoteSince}, across Indonesia, Singapore and outsourced teams. Working this way for
          {' '}{figures.yearsRemote} years has made the practice written-first by necessity: specifications, decision
          records, runbooks and release notes are how the work is handed over, not paperwork produced afterwards.
        </p>
        <p className="prose-page mt-4 text-body text-ink-muted">
          Based in {identity.location} ({identity.timezone}), {positioning.overlap}.{' '}
          {positioning.availability} in field-service, operations, HR/payroll or fintech software.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/cv"
            className="group flex items-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-meta font-medium text-ink transition-colors hover:bg-surface-sunk"
          >
            Read the full CV
            <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={`mailto:${identity.email}`}
            className="text-meta text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
          >
            {identity.email}
          </a>
        </div>
      </section>
    </div>
  );
}
