import { PartHeading } from '@/modules/work/components/part-heading';
import { describeCaseStudyPart } from '@/modules/work/lib/case-study-parts';

/**
 * The claim the rest of the page argues with, so it gets its own weight. The
 * first step of the part indicator; its heading is where "Reported" jumps to.
 */
export function ReportedQuote({ reported }: { reported: string }) {
  const { id, legend, step } = describeCaseStudyPart('reported');

  return (
    <section
      className='card reported-quote from-signal-wash to-surface overflow-hidden bg-linear-to-br p-6 sm:p-7'
      aria-labelledby={id}
      data-step={step}
    >
      <PartHeading
        id={id}
        legend={legend}
      />
      <blockquote className='text-lead text-ink mt-3 text-pretty'>&ldquo;{reported}&rdquo;</blockquote>
    </section>
  );
}
