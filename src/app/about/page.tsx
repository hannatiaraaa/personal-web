import type { Metadata } from 'next';
import { Arc, Intro, Mathematics, WorkingStyle } from '@/modules/about';

export const metadata: Metadata = {
  title: 'About',
  description:
    'From mathematics research to clinical mobile apps at Nalagenetics and a fleet maintenance and procurement platform: how I went from frontend to owning offline data, the API, ERP integration, the release gate and review.',
};

export default function AboutPage() {
  return (
    <div className='space-y-16'>
      <Intro />
      <Arc />
      <Mathematics />
      <WorkingStyle />
    </div>
  );
}
