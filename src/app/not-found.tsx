import Link from 'next/link';
import { ArrowIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <div className="py-10">
      <p className="legend">404</p>
      <h1 className="mt-3 text-h1 font-semibold tracking-[-0.02em] text-ink">That page is not here</h1>
      <p className="mt-4 max-w-xl text-body text-ink-muted">
        The site was rebuilt in 2026 and a few paths moved. The work is the place to start.
      </p>
      <Link
        href="/work"
        className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-meta font-medium text-bg transition-opacity hover:opacity-90"
      >
        Read the case studies
        <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
