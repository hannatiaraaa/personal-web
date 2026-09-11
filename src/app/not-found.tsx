import Link from 'next/link';
import { ArrowIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <div className='py-10'>
      <p className='legend'>404</p>
      <h1 className='text-h1 text-ink mt-3 font-semibold tracking-[-0.02em]'>That page is not here</h1>
      <p className='text-body text-ink-muted mt-4 max-w-xl'>
        The site was rebuilt in 2026 and a few paths moved. The work is the place to start.
      </p>
      <Link
        href='/work'
        className='group bg-ink text-meta text-bg mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2.5 font-medium transition-opacity hover:opacity-90'
      >
        Read the case studies
        <ArrowIcon className='transition-transform group-hover:translate-x-0.5' />
      </Link>
    </div>
  );
}
