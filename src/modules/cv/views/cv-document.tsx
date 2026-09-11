import { awards, certifications, highlights, languages, resumePdf, roles, summary } from '@/content/cv';
import { education, publications } from '@/content/facts';
import { DownloadIcon } from '@/common/components/icons';
import { CvSection } from '@/modules/cv/components/cv-section';

/**
 * The CV as indexable HTML. It is one document rather than several sections,
 * so it stays one file — splitting each block out would cost eight files that
 * a reader has to reassemble.
 */
export function CvDocument() {
  return (
    <>
      {/* The PDF is served from this origin. The previous site linked a Google
          Drive item id, which was neither indexable nor durable. */}
      <a
        href={resumePdf}
        className='btn-primary'
      >
        <DownloadIcon />
        Download as PDF
      </a>

      <CvSection legend='Summary'>
        <div className='prose-page text-body text-ink-muted'>
          {/* Index keys: two CV paragraphs can open with the same words, and a
              duplicate key mis-reconciles the list on the next copy edit. */}
          {summary.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </CvSection>

      <CvSection legend='Career highlights'>
        <ul className='prose-page text-body text-ink-muted space-y-3'>
          {highlights.map((item, index) => (
            <li
              key={index}
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
      </CvSection>

      <CvSection legend='Experience'>
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
                {role.bullets.map((bullet, index) => (
                  <li
                    key={index}
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
      </CvSection>

      <CvSection legend='Education'>
        <p className='text-body text-ink'>
          {education.degree} — {education.institution}, {education.years}
        </p>
        <p className='text-meta text-ink-muted mt-1'>
          Presenter, ICMAMU 2018 International Conference, Bangkok. Head of Public Relations, Mathematics Students
          Union.
        </p>
      </CvSection>

      <CvSection legend='Publications'>
        <ul className='text-meta text-ink-muted space-y-3'>
          {publications.map((paper) => (
            <li key={paper.title}>
              {paper.title}. <span className='text-ink-faint'>{paper.venue}</span>, {paper.year}.
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection legend='Certifications'>
        <ul className='text-meta text-ink-muted space-y-2'>
          {certifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CvSection>

      <CvSection legend='Awards'>
        <ul className='text-meta text-ink-muted space-y-2'>
          {awards.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CvSection>

      <CvSection legend='Languages'>
        <p className='text-meta text-ink-muted'>{languages}</p>
      </CvSection>
    </>
  );
}
