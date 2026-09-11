import Link from 'next/link';
import { figures, identity, positioning } from '@/content/facts';
import { ArrowIcon } from '@/common/components/icons';

/** Remote since 2021, and why that made the practice written-first. */
export function WorkingStyle() {
  return (
    <section aria-labelledby='remote'>
      <hr className='rule-fade' />
      <p className='legend mt-10'>Working style</p>
      <h2
        id='remote'
        className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
      >
        Remote, and written-first
      </h2>
      <p className='prose-page text-body text-ink-muted mt-4'>
        Remote since {identity.remoteSince}, across Indonesia, Singapore and outsourced teams. Working this way for{' '}
        {figures.yearsRemote} years has made the practice written-first by necessity: specifications, decision records,
        runbooks and release notes are how the work is handed over, not paperwork produced afterwards.
      </p>
      <p className='prose-page text-body text-ink-muted mt-4'>
        Based in {identity.location} ({identity.timezone}), {positioning.overlap}. {positioning.availability} in
        field-service, operations, HR/payroll or fintech software.
      </p>
      <div className='mt-6 flex flex-wrap items-center gap-x-6 gap-y-3'>
        <Link
          href='/cv'
          className='btn-primary group'
        >
          Read the full CV
          <ArrowIcon className='transition-transform group-hover:translate-x-0.5' />
        </Link>
        <a
          href={`mailto:${identity.email}`}
          className='text-meta text-ink-muted decoration-line-strong hover:text-ink underline underline-offset-4 transition-colors'
        >
          {identity.email}
        </a>
      </div>
    </section>
  );
}
