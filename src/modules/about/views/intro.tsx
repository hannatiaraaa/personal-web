import { figures, identity, positioning } from '@/content/facts';

/** Who, what the product actually is, and what makes the work hard. */
export function Intro() {
  return (
    <section className='prose-page text-body text-ink-muted'>
      <p>
        I am {identity.name} — {identity.role} at {identity.employer}, {identity.employerParent}. The product is{' '}
        {positioning.product}, and it runs on {figures.vessels} vessels for {figures.realUsers} users across{' '}
        {figures.customerOrgs} large customer organisations, as {positioning.productSurfaces}.
      </p>
      <p>
        It is correctness-critical: approval ladders where a wrong total is a number someone signs, tax arithmetic that
        structurally cannot tax tax, multi-currency, multi-tenant isolation. And it is offline-critical, because the
        people using the app are why it has to work with no network at all.
      </p>
      <p>
        I was not hired for one layer. I kept following the problem into the next one because that is where the answer
        was — and I write the specification and the decision record first, because that is the only way the next person
        can argue with it.
      </p>
    </section>
  );
}
