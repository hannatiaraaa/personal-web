import type { Metadata } from 'next';
// From the view file, not the barrel: the barrel also re-exports the client part
// indicator, and a route ships every client component its imports reach.
import { CaseStudyGrid } from '@/modules/work/views/case-study-grid';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six pieces of shipped work, each written as the problem it turned out to be rather than the project it was called: offline draft ownership, tax arithmetic, a release gate, a configurable approval engine, a module migration, and a native-to-React-Native rebuild.',
};

export default function WorkPage() {
  return <CaseStudyGrid />;
}
