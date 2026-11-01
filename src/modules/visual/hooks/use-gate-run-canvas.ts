'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useInViewport } from '@/common/hooks/use-in-viewport';
import { useMediaQuery } from '@/common/hooks/use-media-query';
import { usePageVisible } from '@/common/hooks/use-page-visible';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { useSceneAttribute } from '@/common/hooks/use-scene-attribute';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { useGateRunSurface } from './use-gate-run-surface';

const FINAL_PROGRESS = 1;
/** Length of one played run where the scene is not pinned. */
const PLAY_DURATION_MS = 11_000;
/** Share of the figure on screen before a run plays by itself. */
const AUTOPLAY_THRESHOLD = 0.6;
const PROGRESS_PROPERTY = '--progress';
const SCENE_SELECTOR = '.scroll-scene';
const SCENE_OBSERVED = ['style'] as const;

/**
 * Drives the gate-run canvas from one of two clocks. Pinned (the `pin` size,
 * motion allowed), progress is the scene's `--progress`. Elsewhere the run rests
 * finished and plays on a clock when asked, or once by itself as it comes into
 * view unless motion is reduced. The drawing is `useGateRunSurface`.
 */
export function useGateRunCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  counterRef: RefObject<HTMLElement | null>,
) {
  // Both read on the first render: this hook only runs in the browser, and a
  // first frame that guessed "not pinned, motion allowed" would arm an autoplay
  // a reader who asked for less motion would then get.
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const inView = useInViewport(canvasRef);
  const isPinned = useMediaQuery(PIN_QUERY);
  const isPlayer = !isPinned || reduced;

  const [isPlaying, setPlaying] = useState(false);
  const progress = useRef(FINAL_PROGRESS);
  const { isPainted, requestFrame } = useGateRunSurface(canvasRef, counterRef, progress);
  const playFrame = useRef(0);
  const hasAutoplayed = useRef(false);

  // Pinned: follow the scene. Observed only while the canvas is near the screen and the tab is visible.
  useSceneAttribute(
    canvasRef,
    SCENE_SELECTOR,
    SCENE_OBSERVED,
    (scene) => {
      if (!(scene instanceof HTMLElement)) return;
      const value = Number.parseFloat(scene.style.getPropertyValue(PROGRESS_PROPERTY));
      progress.current = Number.isNaN(value) ? FINAL_PROGRESS : value;
      requestFrame();
    },
    { isEnabled: !isPlayer, isObserving: inView && visible },
  );

  const finish = useCallback(() => {
    cancelAnimationFrame(playFrame.current);
    playFrame.current = 0;
    progress.current = FINAL_PROGRESS;
    requestFrame();
    setPlaying(false);
  }, [requestFrame]);

  const play = useCallback(() => {
    cancelAnimationFrame(playFrame.current);
    const started = performance.now();
    setPlaying(true);

    const tick = (now: number) => {
      const value = Math.min(FINAL_PROGRESS, (now - started) / PLAY_DURATION_MS);
      progress.current = value;
      requestFrame();
      if (value < FINAL_PROGRESS) playFrame.current = requestAnimationFrame(tick);
      else finish();
    };
    playFrame.current = requestAnimationFrame(tick);
  }, [finish, requestFrame]);

  // Player: at rest the run is finished. A run in progress that leaves the screen, or a switch
  // back to the pinned scene, settles it — nothing keeps playing where nobody is looking.
  useEffect(() => {
    if (!isPlayer) {
      cancelAnimationFrame(playFrame.current);
      playFrame.current = 0;
      setPlaying(false);
      return;
    }
    if (playFrame.current === 0) {
      progress.current = FINAL_PROGRESS;
      requestFrame();
    }
    if (!inView || !visible) finish();
  }, [isPlayer, inView, visible, finish, requestFrame]);

  // Player, motion allowed: play once by itself when most of the figure is on screen.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlayer || reduced || hasAutoplayed.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAutoplayed.current) return;
        hasAutoplayed.current = true;
        observer.disconnect();
        play();
      },
      { threshold: AUTOPLAY_THRESHOLD },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, isPlayer, reduced, play]);

  useEffect(() => () => cancelAnimationFrame(playFrame.current), []);

  return { isPlayer, isPlaying, isPainted, play, finish };
}
