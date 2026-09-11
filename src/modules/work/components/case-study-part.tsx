import { slugify } from '@/common/lib/slug';

type Props = {
  legend: string;
  children: React.ReactNode;
};

/**
 * One of the four parts of a case study.
 *
 * The legend is an `h2`, not styled text. It was a `<p>`, which left every case
 * study with an `h1` and nothing else — a screen-reader user navigating by
 * heading could not reach "What it actually was", "What shipped" or "Evidence".
 * axe does not flag that, and the one-h1-per-page test passes either way.
 */
export function CaseStudyPart({ legend, children }: Props) {
  const id = slugify(legend);

  return (
    <section
      className='reveal'
      aria-labelledby={id}
    >
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='from-sky-high to-signal-cyan h-3 w-0.5 rounded-full bg-linear-to-b'
        />
        <h2
          id={id}
          className='legend'
        >
          {legend}
        </h2>
      </div>
      <div className='prose-page text-body text-ink-muted mt-5'>{children}</div>
    </section>
  );
}
