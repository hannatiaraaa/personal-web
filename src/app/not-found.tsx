import Link from 'next/link';
import { ArrowIcon } from '@/common/components/icons';

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
        className='btn-primary group mt-6'
      >
        Read the case studies
        <ArrowIcon className='transition-transform duration-200 group-hover:translate-x-1' />
      </Link>
    </div>
  );
}
