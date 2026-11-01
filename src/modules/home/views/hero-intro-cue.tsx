import { heroIntro } from '@/content/hero';

/**
 * "Scroll", with a chevron that bobs. Decorative — the page scrolls whether or
 * not it is read — so it is hidden from assistive tech, and it steps away the
 * moment the scene moves.
 */
export function HeroIntroCue() {
  return (
    <div
      aria-hidden='true'
      className='hero-intro-cue'
    >
      <span className='legend'>{heroIntro.cue}</span>
      <svg
        className='hero-intro-cue-chevron'
        width='18'
        height='18'
        viewBox='0 0 18 18'
        fill='none'
      >
        <path
          d='M4 7l5 5 5-5'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}
