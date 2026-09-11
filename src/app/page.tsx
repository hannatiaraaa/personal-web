import { Masthead, Mathematics, Practice, SelectedWork, Visualisation } from '@/modules/home';

export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      <Masthead />
      <hr className='rule-fade' />
      <SelectedWork />
      <Practice />
      <Visualisation />
      <Mathematics />
    </div>
  );
}
