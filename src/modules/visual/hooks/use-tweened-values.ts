'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { tweenValue } from '@/modules/visual/lib/tax-ladder-reveal';

const TWEEN_MS = 420;
const KEY_SEPARATOR = ',';

/**
 * Counts each value to its new target with a short ease-out from whatever is on
 * screen, so a slider dragged mid-count retargets rather than restarts. Idle when
 * the targets already show; instant under reduced motion.
 */
export function useTweenedValues(targets: readonly number[]): readonly number[] {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<readonly number[]>(targets);
  const shownRef = useRef(shown);
  const targetsRef = useRef(targets);
  // The targets' values, not the array's identity, decide when a count starts.
  const targetsKey = targets.join(KEY_SEPARATOR);

  // Kept current after each render, before the count below reads them.
  useEffect(() => {
    shownRef.current = shown;
    targetsRef.current = targets;
  });

  useEffect(() => {
    const goal = targetsRef.current;
    const from = shownRef.current;
    if (goal.length === from.length && goal.every((to, index) => from[index] === to)) return;
    if (reduced) {
      setShown(goal);
      return;
    }

    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - started) / TWEEN_MS, 1);
      setShown(goal.map((to, index) => tweenValue(from[index] ?? to, to, t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetsKey, reduced]);

  return shown;
}
