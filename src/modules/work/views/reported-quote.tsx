/** The claim the rest of the page argues with, so it gets its own weight. */
export function ReportedQuote({ reported }: { reported: string }) {
  return (
    <section
      className='card from-signal-wash to-surface overflow-hidden bg-linear-to-br p-6 sm:p-7'
      aria-labelledby='how-it-was-reported'
    >
      <h2
        id='how-it-was-reported'
        className='legend'
      >
        How it was reported
      </h2>
      <blockquote className='text-lead text-ink mt-3 text-pretty'>&ldquo;{reported}&rdquo;</blockquote>
    </section>
  );
}
