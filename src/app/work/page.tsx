import type { Metadata } from 'next';
import { CaseStudyGrid, EarlierWork } from '@/modules/work';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six pieces of shipped work, each written as the problem it turned out to be rather than the project it was called: offline draft ownership, tax arithmetic, a release gate, a configurable approval engine, a module migration, and a native-to-React-Native rebuild.',
};

export default function WorkPage() {
  return (
    <div className='space-y-16'>
      <CaseStudyGrid />
      <EarlierWork />
    </div>
  );
}
