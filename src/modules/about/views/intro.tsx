import { figures, identity, positioning } from '@/content/facts';

/** Who, and what the product is. How she got there is the arc below. */
export function Intro() {
  return (
    <section className='prose-page text-body text-ink-muted'>
      <p>
        I am {identity.name} — {identity.role} at {identity.employer}, {identity.employerParent}. The product is{' '}
        {positioning.product}, and it runs on {figures.vessels} vessels for {figures.realUsers} users across{' '}
        {figures.customerOrgs} large customer organisations, as {positioning.productSurfaces}.
      </p>
    </section>
  );
}
