import { Fragment, type CSSProperties } from 'react';
import { heroIntro } from '@/content/hero';
import type { IntroPair } from '@/modules/home/lib/intro-pair';
import { splitForReveal } from '@/modules/home/lib/reveal-text';

/** Per-element inputs to the reveal maths in hero-intro.css. */
type RevealStyle = CSSProperties & Record<`--${string}`, number>;

/** Scene progress at which a whole line steps in; matches the slices in hero-intro.css. */
const REPORTED_LABEL_AT = 0.08;
const ACTUAL_LABEL_AT = 0.52;
const RESOLVED_AT = 0.76;

function stepStyle(at: number): RevealStyle {
  return { '--at': at };
}

/**
 * The divergence as a card: the reported sentence typed out, struck through word
 * by word, and what it actually was rising beneath it. Each animated sentence is
 * in the DOM twice — whole for assistive tech, and split and hidden — so a screen
 * reader does not spell it out letter by letter.
 */
export function HeroIntroPair({ pair }: { pair: IntroPair }) {
  const reported = splitForReveal(pair.reported);
  const actually = splitForReveal(pair.actually);

  const reportedStyle: RevealStyle = { '--n': reported.charCount, '--wn': reported.wordCount };
  const actuallyStyle: RevealStyle = { '--wn': actually.wordCount };

  return (
    <div className='hero-intro-card'>
      <p
        className='hero-intro-label hero-intro-step'
        style={stepStyle(REPORTED_LABEL_AT)}
      >
        {heroIntro.reportedLabel}
      </p>
      <p
        className='hero-intro-reported'
        style={reportedStyle}
      >
        <span className='sr-only'>{pair.reported}</span>
        <span aria-hidden='true'>
          {reported.words.map((word) => {
            const wordStyle: RevealStyle = { '--w': word.index };
            return (
              <Fragment key={word.index}>
                <span
                  className='hero-intro-word'
                  style={wordStyle}
                >
                  {word.chars.map((char) => {
                    const charStyle: RevealStyle = { '--i': char.index };
                    return (
                      <span
                        key={char.index}
                        className='hero-intro-char'
                        style={charStyle}
                      >
                        {char.char}
                      </span>
                    );
                  })}
                </span>{' '}
              </Fragment>
            );
          })}
        </span>
      </p>

      <p
        className='hero-intro-label hero-intro-label-signal hero-intro-step'
        style={stepStyle(ACTUAL_LABEL_AT)}
      >
        {heroIntro.actualLabel}
      </p>
      <p
        className='hero-intro-actual'
        style={actuallyStyle}
      >
        <span className='sr-only'>{pair.actually}</span>
        <span aria-hidden='true'>
          {actually.words.map((word) => {
            const wordStyle: RevealStyle = { '--w': word.index };
            return (
              <Fragment key={word.index}>
                <span className='hero-intro-mask'>
                  <span
                    className='hero-intro-rise'
                    style={wordStyle}
                  >
                    {word.text}
                  </span>
                </span>{' '}
              </Fragment>
            );
          })}
        </span>
      </p>

      <p
        className='hero-intro-context hero-intro-step'
        style={stepStyle(RESOLVED_AT)}
      >
        <span className='text-ink-faint text-micro block font-mono'>{pair.context}</span>
        <span className='mt-1 block'>{heroIntro.closing}</span>
      </p>
    </div>
  );
}
