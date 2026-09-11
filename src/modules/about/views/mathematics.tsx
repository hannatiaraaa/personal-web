import { education, figures, publications } from '@/content/facts';
import { ContagionField } from '@/modules/visual/components/contagion-field';

/** The published model runs here rather than being cited. */
export function Mathematics() {
  return (
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
        publication papers — one on classifying the likelihood of spreading hoaxes with a support vector machine, one an
        agent-based model of contagion effects in depression and recovery. It is not a credential I lean on, but it is
        where the habit comes from: find the rule underneath the thing that was reported, write it down, then check it.
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
  );
}
