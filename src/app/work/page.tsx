import type { Metadata } from 'next';
import Link from 'next/link';
import { caseStudies, earlierWork } from '@/content/case-studies';
import { PageHeader } from '@/components/page-header';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six pieces of shipped work, each written as the problem it turned out to be rather than the project it was called: offline draft ownership, tax arithmetic, a release gate, a configurable approval engine, a module migration, and a native-to-React-Native rebuild.',
};

export default function WorkPage() {
  return (
    <div className="space-y-14">
      <PageHeader
        legend="Selected work"
        title="Each of these is one problem that turned out to be something else"
        lead="The reported version of a problem is rarely the problem. These are written the way I actually work through them: how it arrived, what it really was, what shipped, and what the evidence is."
      />

      <ul className="divide-y divide-line">
        {caseStudies.map((study, index) => (
          <li key={study.slug}>
            <Link href={`/work/${study.slug}`} className="group block py-7">
              <div className="flex items-baseline gap-4">
                <span className="tnum font-mono text-micro text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-meta text-ink-faint">
                    Reported: <span className="text-ink-muted">&ldquo;{study.reported}&rdquo;</span>
                  </p>
                  <h2 className="mt-2 flex items-baseline gap-2 text-h3 font-semibold text-ink">
                    <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-signal">
                      {study.title}
                    </span>
                    <ArrowIcon className="shrink-0 text-signal opacity-0 transition-opacity group-hover:opacity-100" />
                  </h2>
                  <p className="mt-2 max-w-2xl text-meta text-ink-muted">{study.summary}</p>
                  <p className="mt-3 font-mono text-micro text-ink-faint">
                    {study.context} · {study.period}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="earlier" className="border-t border-line pt-8">
        <h2 id="earlier" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
          Earlier client work
        </h2>
        <p className="mt-3 max-w-2xl text-meta text-ink-muted">
          Real builds, but the reported problem and the actual problem were the same thing — so they are listed rather
          than written up as case studies they cannot support.
        </p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          {earlierWork.map((item) => (
            <div key={item.title}>
              <dt className="text-h3 font-semibold text-ink">{item.title}</dt>
              <dd className="mt-2 text-meta text-ink-muted">{item.detail}</dd>
              <dd className="mt-2 font-mono text-micro text-ink-faint">{item.stack.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
