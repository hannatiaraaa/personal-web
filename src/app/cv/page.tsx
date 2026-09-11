import type { Metadata } from 'next';
import { identity } from '@/content/facts';
import { PageHeader } from '@/common/components/page-header';
import { CvDocument } from '@/modules/cv';

export const metadata: Metadata = {
  title: 'CV',
  description: `Full CV for ${identity.name} — ${identity.role} on a fleet maintenance and procurement platform, previously mobile engineering in clinical software. Offline-first architecture, approval and procure-to-pay workflows, release automation.`,
};

export default function CvPage() {
  return (
    <div className='space-y-12'>
      <PageHeader
        legend={`${identity.brandLine} · ${identity.stackLine}`}
        title={identity.name}
        lead={`${identity.location} (${identity.timezone}) · remote since ${identity.remoteSince}, seeking full-remote · ${identity.email}`}
      />
      <CvDocument />
    </div>
  );
}
