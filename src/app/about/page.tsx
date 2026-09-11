import type { Metadata } from 'next';
import { Arc, Intro, Mathematics, WorkingStyle } from '@/modules/about';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How I got from frontend to the end of the pipeline: joined a fleet maintenance and procurement platform as a frontend engineer, picked up the API to own the approval rules end to end, then taught myself Playwright and built the release gate.',
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
