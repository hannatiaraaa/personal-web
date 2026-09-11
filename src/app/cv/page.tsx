import type { Metadata } from 'next';
import { awards, certifications, highlights, languages, resumePdf, roles, summary } from '@/content/cv';
import { education, identity, publications } from '@/content/facts';
import { PageHeader } from '@/components/page-header';
import { DownloadIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'CV',
  description: `Full CV for ${identity.name} — ${identity.role} on a fleet maintenance and procurement platform, previously mobile engineering in clinical software. Offline-first architecture, approval and procure-to-pay workflows, release automation.`,
};

function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <section className='reveal'>
      <div className='flex items-center gap-3'>
        <span
          aria-hidden='true'
          className='from-sky-high to-signal-cyan h-3 w-0.5 rounded-full bg-linear-to-b'
        />
        <h2 className='legend'>{legend}</h2>
      </div>
      <div className='mt-5'>{children}</div>
    </section>
  );
}

export default function CvPage() {
  return (
    <div className='space-y-12'>
      <PageHeader
        legend={`${identity.brandLine} · ${identity.stackLine}`}
        title={identity.name}
        lead={`${identity.location} (${identity.timezone}) · remote since ${identity.remoteSince}, seeking full-remote · ${identity.email}`}
      />

      {/* The PDF is served from this origin. The previous site linked a Google
          Drive item id, which was neither indexable nor durable. */}
      <a
        href={resumePdf}
        className='btn-primary'
      >
        <DownloadIcon />
        Download as PDF
      </a>

      <Section legend='Summary'>
        <div className='prose-page text-body text-ink-muted'>
          {summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section legend='Career highlights'>
        <ul className='prose-page text-body text-ink-muted space-y-3'>
          {highlights.map((item) => (
            <li
              key={item.slice(0, 40)}
              className='flex gap-3'
            >
              <span
                aria-hidden='true'
                className='from-sky-high to-signal-cyan mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-br'
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section legend='Experience'>
        <div className='space-y-12'>
          {roles.map((role) => (
            <article key={`${role.title}-${role.organisation}`}>
              <h3 className='text-h3 text-ink font-semibold'>
                {role.title} · {role.organisation}
              </h3>
              <p className='text-micro text-ink-faint mt-1 font-mono'>
                {role.period} · {role.location}
              </p>
              {role.organisationNote && <p className='text-meta text-ink-faint mt-1'>{role.organisationNote}</p>}
              {role.context && <p className='prose-page text-meta text-ink-muted mt-3'>{role.context}</p>}
              <ul className='prose-page text-meta text-ink-muted mt-4 space-y-2.5'>
                {role.bullets.map((bullet) => (
                  <li
                    key={bullet.slice(0, 40)}
                    className='flex gap-3'
                  >
                    <span
                      aria-hidden='true'
                      className='bg-line-strong mt-[0.6em] h-1 w-1 shrink-0 rounded-full'
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section legend='Education'>
        <p className='text-body text-ink'>
          {education.degree} — {education.institution}, {education.years}
        </p>
        <p className='text-meta text-ink-muted mt-1'>
          Presenter, ICMAMU 2018 International Conference, Bangkok. Head of Public Relations, Mathematics Students
          Union.
        </p>
      </Section>

      <Section legend='Publications'>
        <ul className='text-meta text-ink-muted space-y-3'>
          {publications.map((paper) => (
            <li key={paper.title}>
              {paper.title}. <span className='text-ink-faint'>{paper.venue}</span>, {paper.year}.
            </li>
          ))}
        </ul>
      </Section>

      <Section legend='Certifications'>
        <ul className='text-meta text-ink-muted space-y-2'>
          {certifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section legend='Awards'>
        <ul className='text-meta text-ink-muted space-y-2'>
          {awards.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section legend='Languages'>
        <p className='text-meta text-ink-muted'>{languages}</p>
      </Section>
    </div>
  );
}
