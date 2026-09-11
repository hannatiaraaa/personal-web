import type { Metadata } from 'next';
import { Delivery, StackGroups } from '@/modules/stack';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'What I reach for daily, the offline-first and on-device work that is genuinely scarce, the architecture and release-quality practice around it, and the maintenance and procurement domain underneath.',
};

export default function StackPage() {
  return (
    <div className='space-y-16'>
      <StackGroups />
      <Delivery />
    </div>
  );
}
