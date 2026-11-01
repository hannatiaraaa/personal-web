'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useState, type RefObject } from 'react';
import { pickActiveStep, readingBandAt, readingBandRootMargin, type StepBounds } from '@/common/lib/scroll-step';

const STEP_SELECTOR = '[data-step]';
const FIRST_STEP = 0;
/** Input that means the reader is scrolling on purpose, so the band leads again. */
const SCROLL_INTENT_EVENTS = ['wheel', 'touchstart', 'pointerdown'] as const;
/** Keys that move focus rather than scroll; anything else hands back to the band. */
const FOCUS_KEYS = new Set(['Tab', 'Shift']);

function stepIndex(element: Element): number | null {
  const index = Number(element.getAttribute('data-step'));
  return Number.isInteger(index) ? index : null;
}

function measureSteps(steps: readonly Element[]): StepBounds[] {
  const bounds: StepBounds[] = [];
  for (const step of steps) {
    const index = stepIndex(step);
    if (index === null) continue;
    const { top, bottom } = step.getBoundingClientRect();
    bounds.push({ index, top, bottom });
  }
  return bounds;
}

/**
 * The index of the `[data-step]` child of the container that the reader is on.
 *
 * An `IntersectionObserver` with its root shrunk to the reading band fires only
 * when a step crosses the band, so there is no scroll listener. Focus moving
 * into a step activates it too, and holds until the reader next scrolls by hand
 * — otherwise the scroll that reveals the focused step would hand it straight back.
 */
export function useActiveStep(containerRef: RefObject<HTMLElement | null>): number {
  const [active, setActive] = useState(FIRST_STEP);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const steps = [...container.querySelectorAll(STEP_SELECTOR)];
    if (steps.length === 0) return;

    let isHeldByFocus = false;

    const onCrossing = () => {
      if (isHeldByFocus) return;
      const band = readingBandAt(window.innerHeight);
      setActive((previous) => pickActiveStep(measureSteps(steps), band, previous));
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const step = event.target.closest(STEP_SELECTOR);
      const index = step && container.contains(step) ? stepIndex(step) : null;
      if (index === null) return;
      isHeldByFocus = true;
      setActive(index);
    };

    const release = () => {
      isHeldByFocus = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!FOCUS_KEYS.has(event.key)) release();
    };

    const observer = new IntersectionObserver(onCrossing, { rootMargin: readingBandRootMargin() });
    for (const step of steps) observer.observe(step);
    container.addEventListener('focusin', onFocusIn);
    window.addEventListener('keydown', onKeyDown);
    for (const type of SCROLL_INTENT_EVENTS) window.addEventListener(type, release, { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('keydown', onKeyDown);
      for (const type of SCROLL_INTENT_EVENTS) window.removeEventListener(type, release);
    };
  }, [containerRef]);

  return active;
}
