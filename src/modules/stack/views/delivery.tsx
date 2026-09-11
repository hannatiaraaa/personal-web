import { process } from '@/content/stack';

/** The practice around the stack, which is the part that is hard to hire for. */
export function Delivery() {
  return (
    <section aria-labelledby='process'>
      <hr className='rule-fade' />
      <p className='legend mt-10'>Delivery</p>
      <h2
        id='process'
        className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
      >
        How it gets delivered
      </h2>
      <dl className='mt-8 grid gap-4 sm:grid-cols-2'>
        {process.map((item) => (
          <div
            key={item.title}
            className='card reveal p-5 sm:p-6'
          >
            <dt className='text-h3 text-ink font-semibold tracking-[-0.015em]'>{item.title}</dt>
            <dd className='text-meta text-ink-muted mt-2.5'>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
