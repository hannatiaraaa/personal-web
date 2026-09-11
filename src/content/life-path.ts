/**
 * The three substrates I have applied the same mathematics to, in order.
 *
 * This is the content behind the hero visualisation: a reaction–diffusion front
 * from my thesis, a double helix from clinical genomics, and ocean swell from
 * offshore fleet operations. All three are waves — a front that travels, two
 * strands in phase opposition, a sum of sinusoids — which is the actual through
 * line of the work rather than a metaphor stretched over it.
 */

export type LifeStage = {
  readonly id: 'research' | 'genomics' | 'ocean';
  readonly period: string;
  readonly label: string;
  /** What the shape on screen is. */
  readonly shape: string;
  /** What it was, in one sentence. */
  readonly detail: string;
};

export const lifeStages: readonly LifeStage[] = [
  {
    id: 'research',
    period: '2017–2019',
    label: 'Mathematics',
    shape: 'A travelling front',
    detail:
      'My thesis modelled a Fisher–Kolmogorov equation with a harvest term: a population spreads as a front, and harvesting decides how far it gets and where it settles.',
  },
  {
    id: 'genomics',
    period: '2021–2023',
    label: 'Clinical genomics',
    shape: 'A double helix',
    detail:
      'Nalagenetics. Patient-facing DNA reports on one React Native codebase, and the client-side encryption that keeps genetic data unreadable at rest.',
  },
  {
    id: 'ocean',
    period: '2024–',
    label: 'Offshore operations',
    shape: 'Ocean swell',
    detail:
      'Altonaut. Planned maintenance, inventory and procurement for crews working at sea, where the app has to hold with no network at all.',
  },
] as const;

/** The line that makes the three shapes one story rather than three pictures. */
export const lifePathThesis =
  'Three substrates, one piece of mathematics: a front that travels, two strands in phase opposition, a sum of waves.';
