import type { Metadata } from 'next';
import { PageHeader } from '@/common/components/page-header';
import { Delivery, StackGroups } from '@/modules/stack';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'What I reach for daily, the offline-first and on-device work that is genuinely scarce, the architecture and release-quality practice around it, and the maintenance and procurement domain underneath.',
};

export default function StackPage() {
  return (
    <div className='space-y-16'>
      <PageHeader
        legend='Stack'
        title='Grouped by what I would reach for on Monday'
        lead='A flat alphabetical list cannot tell you what someone uses from what they once touched. These are ordered by how current they are, and the domain group is the one that takes longest to learn.'
      />
      <StackGroups />
      <Delivery />
    </div>
  );
}
