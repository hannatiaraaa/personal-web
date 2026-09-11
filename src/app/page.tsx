import { Masthead, Mathematics, Offer, Practice, SelectedWork } from '@/modules/home';

export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      <Masthead />
      <Offer />
      <SelectedWork />
      <Practice />
      <Mathematics />
    </div>
  );
}
