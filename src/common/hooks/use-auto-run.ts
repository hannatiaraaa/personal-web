'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { autoRunProgress, type AutoRunSpan } from '@/common/lib/auto-run';
import { useInViewport } from './use-in-viewport';
import { usePageVisible } from './use-page-visible';
import { useReducedMotion } from './use-reduced-motion';

const FINAL_PROGRESS = 1;
/**
 * Share of the element on screen before it plays by itself — or of the screen,
 * for an element taller than half of it, which may never show half of itself.
 */
const AUTOPLAY_SHARE = 0.5;
const AUTOPLAY_THRESHOLDS = [0.1, 0.2, 0.3, 0.4, AUTOPLAY_SHARE];
/** On screen at all: a run that leaves it is settled, not left playing. */
const ON_SCREEN = '0px';

function isMostlyShown(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  const screen = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRatio >= AUTOPLAY_SHARE || entry.intersectionRect.height >= screen * AUTOPLAY_SHARE;
}

type Options = {
  readonly span: AutoRunSpan;
  /** Whether to play once by itself when the element is first mostly on screen. */
  readonly autoplay: boolean;
  /** Called with the run's progress every frame it plays, and with 1 when it is skipped or settled. */
  readonly onProgress: (progress: number) => void;
};

export type AutoRun = {
  readonly isRunning: boolean;
  /** Plays from the start of the span; under reduced motion, lands on the end at once. */
  readonly play: () => void;
  /** Jumps to the end. */
  readonly skip: () => void;
  /** Stops without writing anything, for a scroll that takes the scene back. */
  readonly stop: () => void;
};

/**
 * Plays a scene on a clock: the mode every story uses where it cannot pin. One
 * `requestAnimationFrame` loop, and only while a run is playing; a run that
 * leaves the screen or a hidden tab is settled at its end, so nothing plays
 * where nobody is looking. Under reduced motion it never plays by itself, and
 * a requested run lands on the end.
 */
export function useAutoRun(ref: RefObject<Element | null>, { span, autoplay, onProgress }: Options): AutoRun {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const onScreen = useInViewport(ref, ON_SCREEN);
  const [isRunning, setRunning] = useState(false);
  const frame = useRef(0);
  const hasAutoplayed = useRef(false);
  const report = useRef(onProgress);
  useEffect(() => {
    report.current = onProgress;
  });
  const { from, durationMs } = span;

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setRunning(false);
  }, []);

  const skip = useCallback(() => {
    stop();
    report.current(FINAL_PROGRESS);
  }, [stop]);

  const play = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (reduced) {
      skip();
      return;
    }
    const started = performance.now();
    setRunning(true);
    report.current(from);

    const tick = (now: number) => {
      const value = autoRunProgress(now - started, { from, durationMs });
      report.current(value);
      if (value < FINAL_PROGRESS) frame.current = requestAnimationFrame(tick);
      else stop();
    };
    frame.current = requestAnimationFrame(tick);
  }, [reduced, from, durationMs, skip, stop]);

  // A run off screen or in a hidden tab ends where it would have.
  useEffect(() => {
    if (isRunning && (!onScreen || !visible)) skip();
  }, [isRunning, onScreen, visible, skip]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !autoplay || reduced || hasAutoplayed.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !isMostlyShown(entry) || hasAutoplayed.current) return;
        hasAutoplayed.current = true;
        observer.disconnect();
        play();
      },
      { threshold: AUTOPLAY_THRESHOLDS },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, autoplay, reduced, play]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { isRunning, play, skip, stop };
}
