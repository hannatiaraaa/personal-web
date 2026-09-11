import type { CaseStudy } from '@/content/case-studies';
import { FigureRow } from '@/common/components/figure-row';
import { CaseStudyPart } from '@/modules/work/components/case-study-part';

/** The figures, the thing the figures cannot say, and what it was built with. */
export function Evidence({ study }: { study: CaseStudy }) {
  return (
    <CaseStudyPart legend='Evidence'>
      <FigureRow
        figures={study.evidence}
        variant='inline'
      />

      {study.evidenceNote && <p className='mt-6'>{study.evidenceNote}</p>}

      <ul className='mt-7 flex flex-wrap gap-2'>
        {study.stack.map((item) => (
          <li
            key={item}
            className='chip text-micro'
          >
            {item}
          </li>
        ))}
      </ul>
    </CaseStudyPart>
  );
}
