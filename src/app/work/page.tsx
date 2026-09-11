import type { Metadata } from 'next';
import { PageHeader } from '@/common/components/page-header';
import { CaseStudyGrid, EarlierWork } from '@/modules/work';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Six pieces of shipped work, each written as the problem it turned out to be rather than the project it was called: offline draft ownership, tax arithmetic, a release gate, a configurable approval engine, a module migration, and a native-to-React-Native rebuild.',
};

export default function WorkPage() {
  return (
    <div className='space-y-16'>
      <PageHeader
        legend='Selected work'
        title='Each of these is one problem that turned out to be something else'
        lead='The reported version of a problem is rarely the problem. Each one here is written from the report down to the mechanism that closed it.'
      />
      <CaseStudyGrid />
      <EarlierWork />
    </div>
  );
}
