import type { Metadata } from 'next';
import { identity } from '@/content/facts';
import { CvDocument } from '@/modules/cv';

export const metadata: Metadata = {
  title: 'CV',
  description: `Full CV for ${identity.name} — ${identity.role} on a fleet maintenance and procurement platform, previously mobile engineering in clinical software. Offline-first architecture, approval and procure-to-pay workflows, release automation.`,
};

export default function CvPage() {
  return (
    <div className='space-y-12'>
      <CvDocument />
    </div>
  );
}
