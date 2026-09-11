import { figures } from '@/content/facts';

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

/** "Full-stack" without a path through it is a claim rather than a history. */
export function Arc() {
  return (
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
  );
}
