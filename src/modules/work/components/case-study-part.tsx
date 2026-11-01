import { describeCaseStudyPart, type CaseStudyPartKey } from '@/modules/work/lib/case-study-parts';
import { PartHeading } from './part-heading';

type Props = {
  part: CaseStudyPartKey;
  children: React.ReactNode;
  /** Set after the prose at the column's full width — for a figure wider than a line of text. */
  wide?: React.ReactNode;
};

/**
 * One of the four parts of a case study, and a `data-step` of the part
 * indicator. The legend is an `h2` so a screen-reader user can reach every part
 * by heading — neither axe nor the one-h1 test would catch a `<p>` here.
 */
export function CaseStudyPart({ part, children, wide }: Props) {
  const { id, legend, step } = describeCaseStudyPart(part);

  return (
    <section
      className='reveal'
      aria-labelledby={id}
      data-step={step}
    >
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='from-sky-high to-signal-cyan h-3 w-0.5 rounded-full bg-linear-to-b'
        />
        <PartHeading
          id={id}
          legend={legend}
        />
      </div>
      <div className='prose-page text-body text-ink-muted mt-5'>{children}</div>
      {wide}
    </section>
  );
}
