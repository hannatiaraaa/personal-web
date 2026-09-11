import type { Metadata } from 'next';
import { awards, certifications, highlights, languages, resumePdf, roles, summary } from '@/content/cv';
import { education, identity, publications } from '@/content/facts';
import { PageHeader } from '@/components/page-header';
import { DownloadIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'CV',
  description: `Full CV for ${identity.name} — ${identity.role} on a field-operations platform, previously mobile engineering in clinical software. Offline-first architecture, approval and procure-to-pay workflows, release automation.`,
};

function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-7">
      <h2 className="legend">{legend}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CvPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        legend={`${identity.brandLine} · ${identity.stackLine}`}
        title={identity.name}
        lead={`${identity.location} (${identity.timezone}) · remote since ${identity.remoteSince}, seeking full-remote · ${identity.email}`}
      />

      {/* The PDF is served from this origin. The previous site linked a Google
          Drive item id, which was neither indexable nor durable. */}
      <a
        href={resumePdf}
        className="inline-flex items-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-meta font-medium text-ink transition-colors hover:bg-surface-sunk"
      >
        <DownloadIcon />
        Download as PDF
      </a>

      <Section legend="Summary">
        <div className="prose-page text-body text-ink-muted">
          {summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section legend="Career highlights">
        <ul className="prose-page space-y-3 text-body text-ink-muted">
          {highlights.map((item) => (
            <li key={item.slice(0, 40)} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.6em] h-1 w-3 shrink-0 bg-signal" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section legend="Experience">
        <div className="space-y-10">
          {roles.map((role) => (
            <article key={`${role.title}-${role.organisation}`}>
              <h3 className="text-h3 font-semibold text-ink">
                {role.title} · {role.organisation}
              </h3>
              <p className="mt-1 font-mono text-micro text-ink-faint">
                {role.period} · {role.location}
              </p>
              {role.organisationNote && (
                <p className="mt-1 text-meta text-ink-faint">{role.organisationNote}</p>
              )}
              {role.context && <p className="prose-page mt-3 text-meta text-ink-muted">{role.context}</p>}
              <ul className="prose-page mt-4 space-y-2.5 text-meta text-ink-muted">
                {role.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 40)} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.55em] h-1 w-3 shrink-0 bg-line-strong" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section legend="Education">
        <p className="text-body text-ink">
          {education.degree} — {education.institution}, {education.years}
        </p>
        <p className="mt-1 text-meta text-ink-muted">
          Presenter, ICMAMU 2018 International Conference, Bangkok. Head of Public Relations, Mathematics Students
          Union.
        </p>
      </Section>

      <Section legend="Publications">
        <ul className="space-y-3 text-meta text-ink-muted">
          {publications.map((paper) => (
            <li key={paper.title}>
              {paper.title}. <span className="text-ink-faint">{paper.venue}</span>, {paper.year}.
            </li>
          ))}
        </ul>
      </Section>

      <Section legend="Certifications">
        <ul className="space-y-2 text-meta text-ink-muted">
          {certifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section legend="Awards">
        <ul className="space-y-2 text-meta text-ink-muted">
          {awards.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section legend="Languages">
        <p className="text-meta text-ink-muted">{languages}</p>
      </Section>
    </div>
  );
}
