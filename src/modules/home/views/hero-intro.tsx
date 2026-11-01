import type { CSSProperties } from 'react';
import { ScrollScene } from '@/common/components/scroll-scene';
import type { AutoRunSpan } from '@/common/lib/auto-run';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { caseStudies } from '@/content/case-studies';
import { identity } from '@/content/facts';
import { heroIntro } from '@/content/hero';
import { pickIntroPair } from '@/modules/home/lib/intro-pair';
import { FlowFieldMount } from '@/modules/visual/components/flow-field-mount';
import { HeroIntroCue } from './hero-intro-cue';
import { HeroIntroPair } from './hero-intro-pair';

/**
 * Where each beat starts, as scene progress: the name alone, the report typing
 * in, the strike and what it was, the pull-back. The slices inside each beat
 * are in hero-intro.css.
 */
const HERO_INTRO_BEATS = [0, 0.05, 0.46, 0.76] as const;
const [, , STRIKE_BEAT_START] = HERO_INTRO_BEATS;

/**
 * Below `pin` the scene is not scrubbed: the report rests typed out and the
 * strike, the resolve and the pull-back play once, briefly, by themselves.
 */
const STRIKE_RUN: AutoRunSpan = { from: STRIKE_BEAT_START, durationMs: 2400 };

/**
 * Server-rendered at the scene's start: it opens the page, so the finished scene
 * flashing before hydration would be wrong. Reduced motion (scrolly.css) and
 * `scripting: none` (hero-intro.css) force the end. The strike's start is passed
 * to CSS from here so the number is not repeated.
 */
const START_STYLE: CSSProperties & Record<'--progress' | '--hero-intro-strike-from', number> = {
  '--progress': 0,
  '--hero-intro-strike-from': STRIKE_BEAT_START,
};

/**
 * The opening scene. The name over the pool; then a report someone actually
 * made, typed out, struck through, and replaced by what it turned out to be;
 * then the pool draws back and the page carries on. Pinned for the length of
 * the scene at `pin`, where the stage and the whole card fit one screen; in
 * flow below it, with the strike played on a clock.
 */
export function HeroIntro() {
  const pair = pickIntroPair(caseStudies, heroIntro.studySlug);

  return (
    <ScrollScene
      mode='pinned'
      beats={HERO_INTRO_BEATS}
      initialBeat={0}
      liveQuery={PIN_QUERY}
      autoRun={STRIKE_RUN}
      label={heroIntro.label}
      className='hero-intro -mt-[calc(var(--header-h)+3rem)] sm:-mt-[calc(var(--header-h)+4rem)]'
      style={START_STYLE}
    >
      <div className='hero-intro-stage'>
        <div className='hero-intro-pool'>
          <FlowFieldMount />
        </div>

        <div className='hero-intro-content'>
          <div className='hero-intro-identity'>
            <p className='legend'>
              {identity.brandLine} · {identity.location} · {identity.timezone}
            </p>
            <h1 className='hero-intro-name text-ink font-semibold text-balance'>{identity.name}</h1>
          </div>

          {pair && <HeroIntroPair pair={pair} />}
        </div>

        <HeroIntroCue />
      </div>
    </ScrollScene>
  );
}
