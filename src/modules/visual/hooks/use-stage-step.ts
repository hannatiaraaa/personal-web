'use client';

// Client: a hook — React state and effects, used only by client components.

import { useState, type RefObject } from 'react';
import { useSceneAttribute } from '@/common/hooks/use-scene-attribute';

const STAGE_SELECTOR = '[data-active-step]';
const OBSERVED = ['data-active-step', 'data-stage-state'] as const;

/**
 * The active step of the surrounding scroll stage, for a visual that follows the
 * story in JavaScript. Reads the stage's attribute rather than observing the
 * steps again. `null` with no stage, or when the stage is final (reduced motion).
 */
export function useStageStep(elementRef: RefObject<HTMLElement | null>): number | null {
  const [step, setStep] = useState<number | null>(null);

  useSceneAttribute(elementRef, STAGE_SELECTOR, OBSERVED, (stage) => {
    const isFinal = stage.getAttribute('data-stage-state') === 'final';
    const value = Number(stage.getAttribute('data-active-step'));
    setStep(isFinal || !Number.isInteger(value) ? null : value);
  });

  return step;
}
