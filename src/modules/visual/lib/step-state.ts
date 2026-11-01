/** Where a step sits against the one on screen: drawn done, drawn now, or still to come. */
export type StepState = 'past' | 'current' | 'future';

export function stepState(index: number, current: number): StepState {
  if (index < current) return 'past';
  return index === current ? 'current' : 'future';
}
