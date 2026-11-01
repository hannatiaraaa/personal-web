import { brandSentence, positioning } from '@/content/facts';
import { heroFacts } from '@/content/hero';
import { FunFactCard } from '@/modules/home/components/fun-fact-card';
import { HeroIntro } from './hero-intro';

export function Masthead() {
  return (
    <section className='relative isolate'>
      <div
        aria-hidden='true'
        className='sky-field'
      />

      <HeroIntro />

      <div className='mt-12 grid gap-8 sm:mt-16 lg:grid-cols-[1.618fr_1fr] lg:gap-x-14'>
        <div>
          <p className='text-lead text-ink text-pretty'>{brandSentence}</p>
          <p className='text-body text-ink-muted mt-6'>
            I build <span className='text-ink font-medium'>{positioning.domain}</span> for fleet operations —{' '}
            {positioning.surfaces.join(', ')}. Most of my code is the offline app crews use at sea, where there is no
            network to fall back on.
          </p>
        </div>

        <FunFactCard facts={heroFacts} />
      </div>
    </section>
  );
}
