'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useInViewport } from '@/common/hooks/use-in-viewport';
import { usePageVisible } from '@/common/hooks/use-page-visible';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import {
  createPopulation,
  createRandom,
  DEFAULT_PARAMS,
  State,
  stepPopulation,
  tally,
  type Edges,
  type Population,
  type Tally,
} from '@/modules/visual/lib/contagion';

const AGENT_COUNT = 150;
const MAX_DPR = 2;
const SEED = 20260911;
/** Frames between readout updates. React does not belong in the frame loop. */
const REPORT_EVERY = 6;
/**
 * Frames to settle before drawing the static frame for reduced motion. Enough
 * that the first cohort has passed through recovery, so the still frame shows
 * the endemic mix rather than the seed. Stepped off the commit, because the
 * pair pass is O(n²) and the people who get this path are the ones who asked
 * for less work, not more.
 */
const SETTLE_FRAMES = 300;

type Palette = {
  susceptible: string;
  affected: string;
  recovering: string;
  recovered: string;
  link: string;
};

const EMPTY_TALLY: Tally = { susceptible: 0, affected: 0, recovering: 0, recovered: 0 };

function readPalette(element: HTMLElement): Palette {
  const style = getComputedStyle(element);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;

  return {
    susceptible: token('--ink-faint', '#5b7085'),
    affected: token('--signal-cyan', '#06b6d4'),
    recovering: token('--sky-high', '#0284c7'),
    recovered: token('--line-strong', '#b9d1e7'),
    link: token('--signal-bright', '#0ea5e9'),
  };
}

type Options = {
  beta: number;
  running: boolean;
  generation: number;
};

/** What the setup effect hands to the effect that starts and stops the loop. */
type Controls = {
  start: () => void;
  stop: () => void;
};

/**
 * Drives the contagion canvas. Owns the frame loop, the canvas sizing and the
 * palette; owns no model rules — those are in `lib/contagion`.
 *
 * Two effects on purpose. The first builds the population and the canvas and
 * must not re-run when the figure scrolls past: rebuilding would reseed the
 * epidemic, and a model that restarts every time it leaves the viewport can
 * never show that it settles. The second only starts and stops the loop.
 */
export function useContagionCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const [counts, setCounts] = useState<Tally>(EMPTY_TALLY);

  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef);
  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

  // Read inside the loop rather than restarting it when a control moves.
  const betaRef = useRef(options.beta);
  betaRef.current = options.beta;
  const runningRef = useRef(options.running);
  runningRef.current = options.running;

  const controlsRef = useRef<Controls | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const random = createRandom(SEED + options.generation);
    const population = createPopulation(AGENT_COUNT, random, 0.04);

    let palette = readPalette(canvas);
    let width = 0;
    let height = 0;
    // The last frame drawn, so a resize can repaint it rather than blank it.
    let lastEdges: Edges = [];

    const step = () => stepPopulation(population, { ...DEFAULT_PARAMS, beta: betaRef.current }, random);

    const draw = (people: Population, edges: Edges) => {
      lastEdges = edges;
      context.clearRect(0, 0, width, height);

      context.strokeStyle = palette.link;
      context.globalAlpha = 0.14;
      context.lineWidth = 0.6;
      context.beginPath();
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e]!;
        const b = edges[e + 1]!;
        context.moveTo(people.x[a]! * width, people.y[a]! * height);
        context.lineTo(people.x[b]! * width, people.y[b]! * height);
      }
      context.stroke();

      for (let i = 0; i < people.size; i += 1) {
        const state = people.state[i];
        let colour = palette.susceptible;
        let radius = 2;
        let alpha = 0.9;

        if (state === State.Affected) {
          colour = palette.affected;
          radius = 3.1;
          alpha = 1;
        } else if (state === State.Recovering) {
          colour = palette.recovering;
          radius = 2.6;
          alpha = 0.95;
        } else if (state === State.Recovered) {
          colour = palette.recovered;
          radius = 1.7;
          alpha = 0.4;
        }

        const cx = people.x[i]! * width;
        const cy = people.y[i]! * height;

        context.globalAlpha = alpha;
        context.fillStyle = colour;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fill();

        // Only the infectious carry a halo, so the eye finds the front.
        if (state === State.Affected) {
          context.globalAlpha = 0.16;
          context.beginPath();
          context.arc(cx, cy, radius * 3.4, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.globalAlpha = 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Assigning width or height clears the canvas, and ResizeObserver fires
      // once on observe(), so without this the figure blanks itself on mount.
      draw(population, lastEdges);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const repaint = () => draw(population, lastEdges);

    // The palette comes from CSS tokens, so a theme change has to re-read it —
    // from the toggle, and from the system for a visitor who never used it.
    const applyPalette = () => {
      palette = readPalette(canvas);
      repaint();
    };

    const themeObserver = new MutationObserver(applyPalette);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', applyPalette);

    let frameHandle = 0;
    let sinceReport = 0;

    const loop = () => {
      // A paused loop that keeps scheduling itself is a loop running when
      // nobody is looking. Pausing stops the frames; Play starts them again.
      if (!runningRef.current) {
        frameHandle = 0;
        return;
      }

      draw(population, step());

      sinceReport += 1;
      if (sinceReport >= REPORT_EVERY) {
        sinceReport = 0;
        setCounts(tally(population));
      }

      frameHandle = requestAnimationFrame(loop);
    };

    const controls: Controls = {
      start: () => {
        if (!frameHandle) frameHandle = requestAnimationFrame(loop);
      },
      stop: () => {
        if (frameHandle) cancelAnimationFrame(frameHandle);
        frameHandle = 0;
      },
    };
    controlsRef.current = controls;

    // First paint. Settling is stepped off the commit so a long synchronous
    // pass never blocks it.
    const settleHandle = requestAnimationFrame(() => {
      const frames = reducedMotion ? SETTLE_FRAMES : 1;
      let edges: Edges = [];
      for (let frame = 0; frame < frames; frame += 1) edges = step();

      draw(population, edges);
      setCounts(tally(population));
    });

    return () => {
      cancelAnimationFrame(settleHandle);
      controls.stop();
      controlsRef.current = null;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyPalette);
    };
  }, [canvasRef, options.generation, reducedMotion]);

  // Starting and stopping is all this one does — the scene outlives it.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (shouldAnimate && options.running) controls.start();
    else controls.stop();
  }, [shouldAnimate, options.running]);

  return { counts, reducedMotion, agentCount: AGENT_COUNT };
}
