import { HowItIsBuilt, Masthead, Mathematics, Practice, SelectedWork } from '@/modules/home';

export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      <Masthead />
      <HowItIsBuilt />
      <SelectedWork />
      <Practice />
      <Mathematics />
    </div>
  );
}
