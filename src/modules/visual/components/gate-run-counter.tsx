import type { Ref } from 'react';
import { illustrativeLabels } from '@/content/interactive-labels';

type Props = { text: string; ref?: Ref<HTMLSpanElement> };

/**
 * The illustrative run's tally. Hidden from assistive tech because it moves every
 * frame; it says "illustrative" so it is never read as the stamp's published figures.
 */
export function GateRunCounter({ text, ref }: Props) {
  return (
    <p
      aria-hidden='true'
      className='gate-run-counter tnum'
    >
      <span className='gate-run-counter-label'>{illustrativeLabels.run}</span> <span ref={ref}>{text}</span>
    </p>
  );
}
