import type { CaseStudy } from '@/content/case-studies';
import { Bullet } from '@/modules/work/components/bullet';
import { CaseStudyPart } from '@/modules/work/components/case-study-part';

export function WhatShipped({ study }: { study: CaseStudy }) {
  return (
    <CaseStudyPart legend='What shipped'>
      <ul className='space-y-3'>
        {study.shipped.map((item, index) => (
          <li
            key={index}
            className='flex gap-3'
          >
            <Bullet />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </CaseStudyPart>
  );
}
