import type { Metadata } from 'next';
import { process, stackGroups } from '@/content/stack';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'What I reach for daily, the offline-first and on-device work that is genuinely scarce, the architecture and release-quality practice around it, and the field-operations domain underneath.',
};

export default function StackPage() {
  return (
    <div className="space-y-14">
      <PageHeader
        legend="Stack"
        title="Grouped by what I would reach for on Monday"
        lead="A flat alphabetical list cannot tell you what someone uses from what they once touched. These are ordered by how current they are, and the domain group is the one that takes longest to learn."
      />

      <div className="space-y-12">
        {stackGroups.map((group) => (
          <section key={group.title} aria-labelledby={group.title}>
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <h2 id={group.title} className="text-h2 font-semibold tracking-[-0.02em] text-ink">
                {group.title}
              </h2>
              <p className="max-w-md text-meta text-ink-muted sm:text-right">{group.note}</p>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-meta text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="process" className="border-t border-line pt-8">
        <h2 id="process" className="text-h2 font-semibold tracking-[-0.02em] text-ink">
          How it gets delivered
        </h2>
        <dl className="mt-6 grid gap-7 sm:grid-cols-2">
          {process.map((item) => (
            <div key={item.title}>
              <dt className="text-h3 font-semibold text-ink">{item.title}</dt>
              <dd className="mt-2 text-meta text-ink-muted">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
