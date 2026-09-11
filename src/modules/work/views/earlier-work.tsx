import { earlierWork } from '@/content/case-studies';

/**
 * Real builds where the reported problem and the actual problem were the same
 * thing. Listed rather than written up as case studies they cannot support.
 */
export function EarlierWork() {
  return (
    <section aria-labelledby='earlier'>
      <hr className='rule-fade' />
      <div className='pt-10'>
        <p className='legend'>Earlier client work</p>
        <h2
          id='earlier'
          className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
        >
          Real builds, without the divergence
        </h2>
        <p className='text-meta text-ink-muted mt-3 max-w-2xl'>
          Here the reported problem and the actual problem were the same thing, so they are listed rather than written
          up as case studies they cannot support.
        </p>

        <dl className='mt-7 grid gap-4 sm:grid-cols-3'>
          {earlierWork.map((item) => (
            <div
              key={item.title}
              className='card reveal p-5'
            >
              <dt className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{item.title}</dt>
              <dd className='text-meta text-ink-muted mt-2'>{item.detail}</dd>
              <dd className='text-micro text-ink-faint mt-3 font-mono'>{item.stack.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
