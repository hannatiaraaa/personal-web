import { ScrollyStage } from '@/common/components/scrolly-stage';
import { publications } from '@/content/facts';
import { GuidedContagionField } from '@/modules/visual/components/guided-contagion-field';

/** The walk beside the model. Each step's parameters are in `lib/contagion-walk`. */
const WALK = [
  {
    title: 'At low beta',
    body: 'Contact inside a radius transmits with probability beta. Set low, it passes through the population slowly.',
  },
  {
    title: 'Raise beta',
    body: 'More contacts transmit, so it moves through faster. It still does not burn out.',
  },
  {
    title: 'The relapse term',
    body: 'A recovered agent can relapse straight back to affected. That term is why the system holds at a level instead of burning out.',
  },
] as const;

/** The published model runs here rather than being cited. */
export function Mathematics() {
  const steps = WALK.map((step) => (
    <div
      key={step.title}
      className='walk-step'
    >
      <h3 className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{step.title}</h3>
      <p className='text-meta text-ink-muted mt-2'>{step.body}</p>
    </div>
  ));

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
        One of the published papers is an agent-based model of contagion in depression and its recovery. It runs here
        rather than being cited. The habit it left: find the rule underneath the thing that was reported, write it down,
        then check it.
      </p>
      {/* Only where the walk runs: pinned, with motion (scrolly-about.css). */}
      <p className='maths-walk-hint text-meta text-ink-faint mt-4 motion-reduce:hidden'>
        The model follows these three steps until you move a control.
      </p>

      <ScrollyStage
        label='The contagion model, step by step'
        visual={<GuidedContagionField />}
        steps={steps}
        visualSide='end'
        className='maths-stage mt-8'
      />

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
