import type { CaseStudy } from '@/content/case-studies';
import { PartIndicator } from '@/modules/work/components/part-indicator';
import { Evidence } from '@/modules/work/views/evidence';
import { ReportedQuote } from '@/modules/work/views/reported-quote';
import { WhatActuallyWas } from '@/modules/work/views/what-actually-was';
import { WhatShipped } from '@/modules/work/views/what-shipped';

/** The four parts in reading order, tracked by the part indicator. */
export function CaseStudyStory({ study }: { study: CaseStudy }) {
  return (
    <PartIndicator>
      <ReportedQuote reported={study.reported} />
      <WhatActuallyWas study={study} />
      <WhatShipped study={study} />
      <Evidence study={study} />
    </PartIndicator>
  );
}
