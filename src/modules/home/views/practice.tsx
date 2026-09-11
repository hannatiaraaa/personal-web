import { figures } from '@/content/facts';

const practice = [
  {
    term: 'Problem framing before code',
    detail:
      'I take the ambiguous version of the request, find the rule underneath it with the people who live it, write the specification, then build the most ideal implementation through a reliable program.',
  },
  {
    term: 'Designed so the next change is configuration',
    detail: `Approval hierarchies, spending authority and charts of accounts are configured, not branched per customer. Every customer organisation runs its own rules with no code change.`,
  },
  {
    term: 'Release quality as a system',
    detail: `${figures.releaseCases} deterministic cases and ${figures.permissionChecks} authorization decisions per run, with inherited debt quarantined by name so it cannot count as a pass.`,
  },
] as const;

/** What a hiring manager wants after "what" and "how much". */
export function Practice() {
  return (
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
  );
}
