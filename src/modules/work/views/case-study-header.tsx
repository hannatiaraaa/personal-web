import Link from 'next/link';
import type { CaseStudy } from '@/content/case-studies';

export function CaseStudyHeader({ study }: { study: CaseStudy }) {
  return (
    <header>
      <Link
        href='/work'
        className='text-micro text-ink-muted hover:text-signal font-mono uppercase transition-colors'
      >
        ← All work
      </Link>

      <p className='legend mt-6'>
        {study.context} · {study.period}
      </p>

      <h1 className='text-h1 text-ink mt-3 max-w-3xl font-semibold tracking-[-0.02em] text-balance'>{study.title}</h1>

      <p className='text-lead text-ink-muted mt-4 max-w-2xl'>{study.summary}</p>
    </header>
  );
}
