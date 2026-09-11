import { caseStudies } from '@/content/case-studies';
import { CaseStudyCard } from '@/modules/work/components/case-study-card';

/** All six, newest domain first. The index and the home preview share the card. */
export function CaseStudyGrid() {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {caseStudies.map((study, index) => (
        <CaseStudyCard
          key={study.slug}
          study={study}
          index={index}
        />
      ))}
    </div>
  );
}
