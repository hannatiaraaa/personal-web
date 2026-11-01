'use client';

// Client because it owns a canvas, a frame loop and two controls.

import { useRef, useState } from 'react';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { useContagionCanvas } from '@/modules/visual/hooks/use-contagion-canvas';
import { BETA_SLIDER, type WalkParams } from '@/modules/visual/lib/contagion-walk';

type Props = {
  /**
   * Parameters a guided walk is setting, if one is. They steer the model until
   * the visitor touches a control; from then on the visitor's settings hold
   * for the rest of the visit. Ignored under reduced motion.
   */
  walk?: WalkParams | null;
};

/**
 * The agent-based contagion model from one of my published papers, running
 * rather than cited. The rules live in `lib/contagion`; the frame loop lives in
 * `useContagionCanvas`; this file is the markup and the controls.
 */
export function ContagionField({ walk = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [beta, setBeta] = useState<number>(BETA_SLIDER.initial);
  const [generation, setGeneration] = useState(0);
  const [hasTakenOver, setHasTakenOver] = useState(false);

  const reducedMotion = useReducedMotion();
  const steering = walk && !hasTakenOver && !reducedMotion ? walk : null;
  const shownBeta = steering ? steering.beta : beta;
  const isRunning = steering ? steering.running : running;

  // The visitor's first touch keeps what the walk had set, then applies
  // their change on top — the model never jumps back to an older setting.
  const takeOver = () => {
    if (!steering) return;
    setBeta(steering.beta);
    setRunning(steering.running);
    setHasTakenOver(true);
  };

  const changeBeta = (value: number) => {
    takeOver();
    setBeta(value);
  };

  const togglePlaying = () => {
    takeOver();
    setRunning(!isRunning);
  };

  const reset = () => {
    takeOver();
    setGeneration((value) => value + 1);
  };

  const { counts, agentCount } = useContagionCanvas(canvasRef, {
    beta: shownBeta,
    running: isRunning,
    generation,
  });

  const legend = [
    { label: 'susceptible', value: counts.susceptible, swatch: 'bg-ink-faint' },
    { label: 'affected', value: counts.affected, swatch: 'bg-signal-cyan' },
    { label: 'recovering', value: counts.recovering, swatch: 'bg-sky-high' },
    { label: 'recovered', value: counts.recovered, swatch: 'bg-line-strong' },
  ];

  return (
    <figure className='card overflow-hidden'>
      <canvas
        ref={canvasRef}
        className='block h-[16rem] w-full sm:h-[21rem]'
        role='img'
        aria-label={`Agent-based contagion simulation with ${agentCount} agents. Currently ${counts.susceptible} susceptible, ${counts.affected} affected, ${counts.recovering} recovering and ${counts.recovered} recovered.`}
      />

      <div className='border-line flex flex-wrap items-center gap-x-5 gap-y-3 border-t px-4 py-3'>
        <dl className='flex flex-wrap gap-x-4 gap-y-2'>
          {legend.map((item) => (
            <div
              key={item.label}
              className='flex items-center gap-2'
            >
              <span
                aria-hidden='true'
                className={`h-2 w-2 rounded-full ${item.swatch}`}
              />
              <dt className='text-micro text-ink-faint font-mono uppercase'>{item.label}</dt>
              <dd className='tnum text-meta text-ink font-mono'>{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className='ml-auto flex flex-wrap items-center gap-3'>
          <label className='text-micro text-ink-faint flex items-center gap-2 font-mono uppercase'>
            <span>beta</span>
            <input
              type='range'
              min={BETA_SLIDER.min}
              max={BETA_SLIDER.max}
              step={BETA_SLIDER.step}
              value={shownBeta}
              onChange={(event) => changeBeta(Number(event.target.value))}
              className='h-6 w-20 accent-[var(--signal)] pointer-coarse:h-11 pointer-coarse:w-28'
              aria-label='Transmission probability per contact'
            />
            <span className='tnum text-meta text-ink normal-case'>{shownBeta.toFixed(3)}</span>
          </label>

          {!reducedMotion && (
            <button
              type='button'
              onClick={togglePlaying}
              className='chip'
            >
              {isRunning ? 'Pause' : 'Play'}
            </button>
          )}
          <button
            type='button'
            onClick={reset}
            className='chip'
          >
            Reset
          </button>
        </div>
      </div>

      {reducedMotion && (
        <p className='border-line text-micro text-ink-faint border-t px-4 py-2 font-mono'>
          Still frame — motion is switched off in your settings. The model was run forward before it was drawn, so this
          is the level it settles at. Move beta or reset to redraw.
        </p>
      )}

      <figcaption className='border-line text-meta text-ink-muted border-t px-4 py-3'>
        Contact inside a radius transmits with probability <span className='font-mono'>beta</span>. An affected agent
        moves to recovering, then recovered, and a recovered agent can relapse straight back to affected. That relapse
        term is why the system holds at a level instead of burning out — raise <span className='font-mono'>beta</span>{' '}
        and the level moves, not the outcome.
      </figcaption>
    </figure>
  );
}
