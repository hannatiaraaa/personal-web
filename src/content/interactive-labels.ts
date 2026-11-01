/*
 * The labels every interactive shares. Their own file, not interactives.ts,
 * because client components import them: a client import of interactives.ts
 * puts all of its copy in the case-study route's First Load JS.
 */

/** The on-screen labels that keep a model's numbers from reading as published ones. */
export const illustrativeLabels = {
  numbers: 'Illustrative numbers',
  simulation: 'Illustrative simulation',
  run: 'Illustrative run',
} as const;

/** The board heading shared by the hands-on pieces. */
export const tryItLegend = 'Try it';
