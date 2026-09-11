'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * An agent-based contagion model with a recovery process — the subject of one of
 * my two published papers, running live rather than described.
 *
 * Each dot is an agent on a random walk. Contact inside a radius transmits with
 * probability beta; an affected agent moves to recovering, then recovered, and
 * a recovered agent can relapse. That last term is the point of the paper: with
 * relapse the system settles into an endemic equilibrium instead of burning out,
 * and you can watch it find that level from any starting condition.
 *
 * Written to cost almost nothing: no library, one canvas, one rAF loop that
 * stops the moment the figure leaves the viewport, and a single static frame
 * instead of a loop when reduced motion is requested.
 */

const AGENTS = 150;
const CONTACT_RADIUS = 0.062;
const LINK_RADIUS = 0.055;
const SPEED = 0.00085;
const RECOVERING_AFTER = 150;
const RECOVERED_AFTER = 260;
const RELAPSE_PER_FRAME = 0.00035;
const MAX_DPR = 2;

const SUSCEPTIBLE = 0;
const AFFECTED = 1;
const RECOVERING = 2;
const RECOVERED = 3;

type Palette = {
  susceptible: string;
  affected: string;
  recovering: string;
  recovered: string;
  link: string;
};

type Counts = { susceptible: number; affected: number; recovering: number; recovered: number };

/** Deterministic start: the same seed every load, so the figure is reproducible. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

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

export function ContagionField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [running, setRunning] = useState(true);
  const [beta, setBeta] = useState(0.035);
  const [counts, setCounts] = useState<Counts>({ susceptible: 0, affected: 0, recovering: 0, recovered: 0 });
  const [reduced, setReduced] = useState(false);
  const [generation, setGeneration] = useState(0);

  const betaRef = useRef(beta);
  betaRef.current = beta;
  const runningRef = useRef(running);
  runningRef.current = running;

  const reset = useCallback(() => setGeneration((value) => value + 1), []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const random = makeRandom(20260911 + generation);
    const x = new Float32Array(AGENTS);
    const y = new Float32Array(AGENTS);
    const vx = new Float32Array(AGENTS);
    const vy = new Float32Array(AGENTS);
    const state = new Uint8Array(AGENTS);
    const age = new Uint16Array(AGENTS);

    for (let i = 0; i < AGENTS; i += 1) {
      x[i] = random();
      y[i] = random();
      const angle = random() * Math.PI * 2;
      vx[i] = Math.cos(angle) * SPEED;
      vy[i] = Math.sin(angle) * SPEED;
      state[i] = random() < 0.04 ? AFFECTED : SUSCEPTIBLE;
    }

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

    // The palette is read from CSS tokens, so a theme change has to re-read it.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const step = () => {
      for (let i = 0; i < AGENTS; i += 1) {
        // Small heading jitter keeps the walk from looking like linear drift.
        vx[i]! += (random() - 0.5) * SPEED * 0.4;
        vy[i]! += (random() - 0.5) * SPEED * 0.4;
        const speed = Math.hypot(vx[i]!, vy[i]!) || SPEED;
        vx[i] = (vx[i]! / speed) * SPEED;
        vy[i] = (vy[i]! / speed) * SPEED;

        x[i]! += vx[i]!;
        y[i]! += vy[i]!;

        if (x[i]! < 0 || x[i]! > 1) vx[i] = -vx[i]!;
        if (y[i]! < 0 || y[i]! > 1) vy[i] = -vy[i]!;
        x[i] = Math.min(1, Math.max(0, x[i]!));
        y[i] = Math.min(1, Math.max(0, y[i]!));

        if (state[i] === AFFECTED || state[i] === RECOVERING) {
          age[i]! += 1;
          if (age[i]! > RECOVERED_AFTER) {
            state[i] = RECOVERED;
            age[i] = 0;
          } else if (age[i]! > RECOVERING_AFTER) {
            state[i] = RECOVERING;
          }
        } else if (state[i] === RECOVERED && random() < RELAPSE_PER_FRAME) {
          state[i] = SUSCEPTIBLE;
        }
      }

      // Transmission and the contact network in one pass over the pairs.
      const contact = CONTACT_RADIUS * CONTACT_RADIUS;
      const link = LINK_RADIUS * LINK_RADIUS;
      const edges: number[] = [];

      for (let i = 0; i < AGENTS; i += 1) {
        for (let j = i + 1; j < AGENTS; j += 1) {
          const dx = x[i]! - x[j]!;
          const dy = y[i]! - y[j]!;
          const distance = dx * dx + dy * dy;
          if (distance > contact) continue;

          if (distance < link) edges.push(i, j);

          const iInfectious = state[i] === AFFECTED;
          const jInfectious = state[j] === AFFECTED;
          if (iInfectious === jInfectious) continue;

          const target = iInfectious ? j : i;
          if (state[target] === SUSCEPTIBLE && random() < betaRef.current) {
            state[target] = AFFECTED;
            age[target] = 0;
          }
        }
      }

      return edges;
    };

    const draw = (edges: number[]) => {
      context.clearRect(0, 0, width, height);

      context.strokeStyle = palette.link;
      context.globalAlpha = 0.14;
      context.lineWidth = 0.6;
      context.beginPath();
      for (let e = 0; e < edges.length; e += 2) {
        const i = edges[e]!;
        const j = edges[e + 1]!;
        context.moveTo(x[i]! * width, y[i]! * height);
        context.lineTo(x[j]! * width, y[j]! * height);
      }
      context.stroke();
      context.globalAlpha = 1;

      const tally: Counts = { susceptible: 0, affected: 0, recovering: 0, recovered: 0 };

      for (let i = 0; i < AGENTS; i += 1) {
        let colour = palette.susceptible;
        let radius = 2;
        let alpha = 0.9;

        if (state[i] === AFFECTED) {
          colour = palette.affected;
          radius = 3.1;
          alpha = 1;
          tally.affected += 1;
        } else if (state[i] === RECOVERING) {
          colour = palette.recovering;
          radius = 2.6;
          alpha = 0.95;
          tally.recovering += 1;
        } else if (state[i] === RECOVERED) {
          colour = palette.recovered;
          radius = 1.7;
          alpha = 0.4;
          tally.recovered += 1;
        } else {
          tally.susceptible += 1;
        }

        context.globalAlpha = alpha;
        context.fillStyle = colour;
        context.beginPath();
        context.arc(x[i]! * width, y[i]! * height, radius, 0, Math.PI * 2);
        context.fill();

        // Only the actively infectious carry a halo, so the eye finds the front.
        if (state[i] === AFFECTED) {
          context.globalAlpha = 0.16;
          context.beginPath();
          context.arc(x[i]! * width, y[i]! * height, radius * 3.4, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.globalAlpha = 1;
      return tally;
    };

    let sinceReport = 0;

    const loop = () => {
      if (runningRef.current) {
        const tally = draw(step());
        sinceReport += 1;
        // Ten updates a second is plenty for a readout and keeps React out of
        // the animation frame.
        if (sinceReport >= 6) {
          sinceReport = 0;
          setCounts(tally);
        }
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    if (reduced) {
      // One settled frame instead of a loop.
      let edges: number[] = [];
      for (let i = 0; i < 420; i += 1) edges = step();
      setCounts(draw(edges));
    } else {
      const visibility = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting) {
            if (!frameRef.current) frameRef.current = requestAnimationFrame(loop);
          } else if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = 0;
          }
        },
        { rootMargin: '120px' },
      );
      visibility.observe(canvas);

      return () => {
        visibility.disconnect();
        resizeObserver.disconnect();
        themeObserver.disconnect();
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      };
    }

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [generation, reduced]);

  const legend = [
    { label: 'susceptible', value: counts.susceptible, className: 'bg-ink-faint' },
    { label: 'affected', value: counts.affected, className: 'bg-signal-cyan' },
    { label: 'recovering', value: counts.recovering, className: 'bg-sky-high' },
    { label: 'recovered', value: counts.recovered, className: 'bg-line-strong' },
  ];

  return (
    <figure className="card overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-[16rem] w-full sm:h-[21rem]"
        role="img"
        aria-label={`Live agent-based contagion simulation with ${AGENTS} agents. Currently ${counts.susceptible} susceptible, ${counts.affected} affected, ${counts.recovering} recovering and ${counts.recovered} recovered.`}
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line px-4 py-3">
        <dl className="flex flex-wrap gap-x-4 gap-y-2">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.className}`} />
              <dt className="font-mono text-micro text-ink-faint uppercase">{item.label}</dt>
              <dd className="tnum font-mono text-meta text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-micro text-ink-faint uppercase">
            <span>beta</span>
            <input
              type="range"
              min={0.005}
              max={0.12}
              step={0.005}
              value={beta}
              onChange={(event) => setBeta(Number(event.target.value))}
              className="h-1 w-20 accent-[var(--signal)]"
              aria-label="Transmission probability per contact"
            />
            <span className="tnum text-meta text-ink normal-case">{beta.toFixed(3)}</span>
          </label>

          {!reduced && (
            <button type="button" onClick={() => setRunning((value) => !value)} className="chip">
              {running ? 'Pause' : 'Play'}
            </button>
          )}
          <button type="button" onClick={reset} className="chip">
            Reset
          </button>
        </div>
      </div>

      <figcaption className="border-t border-line px-4 py-3 text-meta text-ink-muted">
        Contact inside a radius transmits with probability <span className="font-mono">beta</span>; affected agents move
        to recovering, then recovered, and recovered agents can relapse. That relapse term is why the system settles at
        an endemic level instead of burning out — raise <span className="font-mono">beta</span> and watch the level move,
        not the outcome.
      </figcaption>
    </figure>
  );
}
