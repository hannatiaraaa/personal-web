import type { Metadata } from 'next';
import { process, stackGroups } from '@/content/stack';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'What I reach for daily, the offline-first and on-device work that is genuinely scarce, the architecture and release-quality practice around it, and the maintenance and procurement domain underneath.',
};

export default function StackPage() {
  return (
    <div className='space-y-16'>
      <PageHeader
        legend='Stack'
        title='Grouped by what I would reach for on Monday'
        lead='A flat alphabetical list cannot tell you what someone uses from what they once touched. These are ordered by how current they are, and the domain group is the one that takes longest to learn.'
      />

      <div className='space-y-12'>
        {stackGroups.map((group) => (
          <section
            key={group.title}
            aria-labelledby={group.title}
            className='reveal'
          >
            <div className='flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8'>
              <h2
                id={group.title}
                className='text-h2 text-ink flex items-center gap-3 font-semibold tracking-[-0.025em]'
              >
                <span
                  aria-hidden='true'
                  className='from-sky-high to-signal-cyan h-4 w-0.5 rounded-full bg-linear-to-b'
                />
                {group.title}
              </h2>
              <p className='text-meta text-ink-muted max-w-md sm:text-right'>{group.note}</p>
            </div>
            <ul className='mt-5 flex flex-wrap gap-2'>
              {group.items.map((item) => (
                <li
                  key={item}
                  className='chip'
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

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
    </div>
  );
}
