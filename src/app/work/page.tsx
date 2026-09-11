import type { Metadata } from 'next';
import { caseStudies, earlierWork } from '@/content/case-studies';
import { PageHeader } from '@/components/page-header';
import { CaseStudyCard } from '@/components/case-study-card';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six pieces of shipped work, each written as the problem it turned out to be rather than the project it was called: offline draft ownership, tax arithmetic, a release gate, a configurable approval engine, a module migration, and a native-to-React-Native rebuild.',
};

export default function WorkPage() {
  return (
    <div className='space-y-16'>
      <PageHeader
        legend='Selected work'
        title='Each of these is one problem that turned out to be something else'
        lead='The reported version of a problem is rarely the problem. Each one here is written from the report down to the mechanism that closed it.'
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        {caseStudies.map((study, index) => (
          <CaseStudyCard
            key={study.slug}
            study={study}
            index={index}
          />
        ))}
      </div>

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
    </div>
  );
}
