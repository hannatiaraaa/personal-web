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
/** Frames to settle before drawing the single static frame for reduced motion. */
const SETTLE_FRAMES = 420;

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

/**
 * Drives the contagion canvas. Owns the frame loop, the canvas sizing and the
 * palette; owns no model rules — those are in `lib/contagion`.
 *
 * The loop only runs while the figure is on screen, the tab is foregrounded and
 * the visitor has not asked for reduced motion. Under reduced motion it draws
 * one settled frame and stops.
 */
export function useContagionCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const [counts, setCounts] = useState<Tally>(EMPTY_TALLY);

  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inViewport = useInViewport(canvasRef);

  // Read inside the loop rather than restarting it when a control moves.
  const betaRef = useRef(options.beta);
  betaRef.current = options.beta;
  const runningRef = useRef(options.running);
  runningRef.current = options.running;

  const shouldAnimate = !reducedMotion && pageVisible && inViewport;

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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // The palette comes from CSS tokens, so a theme change has to re-read it.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const draw = (people: Population, edges: Edges) => {
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

    if (reducedMotion) {
      let edges: Edges = [];
      for (let frame = 0; frame < SETTLE_FRAMES; frame += 1) {
        edges = stepPopulation(population, { ...DEFAULT_PARAMS, beta: betaRef.current }, random);
      }
      draw(population, edges);
      setCounts(tally(population));

      return () => {
        resizeObserver.disconnect();
        themeObserver.disconnect();
      };
    }

    let frameHandle = 0;
    let sinceReport = 0;

    const loop = () => {
      if (runningRef.current) {
        const edges = stepPopulation(population, { ...DEFAULT_PARAMS, beta: betaRef.current }, random);
        draw(population, edges);

        sinceReport += 1;
        if (sinceReport >= REPORT_EVERY) {
          sinceReport = 0;
          setCounts(tally(population));
        }
      }
      frameHandle = requestAnimationFrame(loop);
    };

    if (shouldAnimate) {
      frameHandle = requestAnimationFrame(loop);
    } else {
      // Not animating yet, but the figure should not be blank.
      draw(population, stepPopulation(population, DEFAULT_PARAMS, random));
      setCounts(tally(population));
    }

    return () => {
      if (frameHandle) cancelAnimationFrame(frameHandle);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [canvasRef, options.generation, reducedMotion, shouldAnimate]);

  return { counts, reducedMotion, agentCount: AGENT_COUNT };
}
