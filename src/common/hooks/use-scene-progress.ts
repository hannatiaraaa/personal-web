'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, type RefObject } from 'react';
import { beatAt, formatProgress, sceneProgress, type SceneMode } from '@/common/lib/scene-progress';
import { useInViewport } from './use-in-viewport';
import { useMediaQuery } from './use-media-query';
import { usePageVisible } from './use-page-visible';
import { useReducedMotion } from './use-reduced-motion';

/** One viewport either side: a scene is already at its true progress before it shows. */
const SCENE_ROOT_MARGIN = '100% 0px';
const PROGRESS_PROPERTY = '--progress';
const FINAL_PROGRESS = 1;
const NO_BEATS: readonly number[] = [];
const EVERY_SCREEN = 'all';

/** Writes a scene's progress, and its beat with `beats`, skipping a write that changes nothing. */
export function writeSceneProgress(element: HTMLElement, value: number, beats: readonly number[] = NO_BEATS): void {
  const text = formatProgress(value);
  if (element.style.getPropertyValue(PROGRESS_PROPERTY) !== text) {
    element.style.setProperty(PROGRESS_PROPERTY, text);
  }
  if (beats.length > 0) {
    const beat = String(beatAt(value, beats));
    if (element.dataset.beat !== beat) element.dataset.beat = beat;
  }
}

/**
 * Drives a scroll scene from JavaScript, so it runs where CSS view timelines do not.
 *
 * Writes `--progress` (0–1) and, with `beats`, `data-beat` straight to the DOM,
 * so a scroll frame re-renders nothing; a per-frame canvas reads `--progress`
 * instead of listening itself. Listens only while the scene is within a viewport
 * and the tab is visible, and measures once more on leaving so a jump past it
 * settles. Under reduced motion it writes the end once and never listens.
 * Outside `liveQuery` nothing pins, so there is nothing to measure: it writes
 * `restProgress` once (the end, unless a clock will play the scene from
 * elsewhere), since each `--progress` write restyles the whole scene.
 */
export function useSceneProgress(
  ref: RefObject<HTMLElement | null>,
  mode: SceneMode,
  beats: readonly number[] = NO_BEATS,
  liveQuery: string = EVERY_SCREEN,
  restProgress: number = FINAL_PROGRESS,
): void {
  const inRange = useInViewport(ref, SCENE_ROOT_MARGIN);
  const isLive = useMediaQuery(liveQuery);
  const visible = usePageVisible();
  const reduced = useReducedMotion();
  const isActive = isLive && inRange && visible && !reduced;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const write = (value: number) => writeSceneProgress(element, value, beats);

    const measure = () => write(sceneProgress(element.getBoundingClientRect(), window.innerHeight, mode));

    if (reduced) {
      write(FINAL_PROGRESS);
      return;
    }
    if (!isLive) {
      write(restProgress);
      return;
    }

    measure();
    if (!isActive) return;

    let frame = 0;
    const onFrame = () => {
      frame = 0;
      measure();
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(onFrame);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, mode, beats, isActive, isLive, reduced, restProgress]);
}
