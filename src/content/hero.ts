/**
 * The pool behind the opening scene is a background, so it is not explained.
 * It gets a fun fact instead: one at a time, each a true thing about one of
 * its layers, with that layer's formula where it has one.
 */
export type HeroFact = {
  readonly text: string;
  readonly formula?: string;
};

export const heroFacts: readonly HeroFact[] = [
  {
    // True and checkable: the parastichy counts of a golden-angle spiral are
    // consecutive Fibonacci numbers. Nobody draws them; they emerge.
    text: 'The dots behind my name sit 137.5° apart, the golden angle. Nobody draws the spiral arms: count them and you get consecutive Fibonacci numbers.',
    formula: 'θ = n · 137.5°,  r = c√n',
  },
  {
    text: 'The bright ring crossing the water is the front of the harvested invasion my thesis modelled.',
    formula: 'uₜ = D∇²u + ru(1 − u) − hu',
  },
  {
    text: 'The swell is a sum of sine waves standing in for the sea the software ships to, where a tablet can go days without a connection.',
    formula: 'Σ aᵢ sin(kᵢ · x + ωᵢt)',
  },
  {
    text: 'The water answers back. Touch or click it anywhere and a ripple spreads from the spot.',
  },
];

export const heroFact = {
  label: 'Fun fact',
  /** Names the card for assistive tech, which cannot see the pool it is about. */
  regionLabel: 'A fun fact about the pool behind the name',
  next: 'Another fact',
  /** Shown under reduced motion, when the pool stands still until touched. */
  still: 'The pool is still — touch to ripple.',
} as const;

/**
 * The opening scene: one case study's report, struck through, and what it was.
 * The shortest report is chosen so it can be set at display size on a phone.
 */
export const heroIntro = {
  studySlug: 'offline-draft-ownership',
  label: 'Opening: a report, and what it turned out to be',
  reportedLabel: 'Reported',
  actualLabel: 'What it was',
  closing: 'Every case study here starts from a sentence like this one.',
  cue: 'Scroll',
} as const;
