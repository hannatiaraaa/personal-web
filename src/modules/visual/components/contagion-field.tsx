'use client';

// Client because it owns a canvas, a frame loop and two controls.

import { useCallback, useRef, useState } from 'react';
import { useContagionCanvas } from '@/modules/visual/hooks/use-contagion-canvas';

const BETA_MIN = 0.005;
const BETA_MAX = 0.12;
const BETA_STEP = 0.005;
const BETA_DEFAULT = 0.035;

/**
 * The agent-based contagion model from one of my published papers, running
 * rather than cited. The rules live in `lib/contagion`; the frame loop lives in
 * `useContagionCanvas`; this file is the markup and the controls.
 */
export function ContagionField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [beta, setBeta] = useState(BETA_DEFAULT);
  const [generation, setGeneration] = useState(0);

  const reset = useCallback(() => setGeneration((value) => value + 1), []);
  const { counts, reducedMotion, agentCount } = useContagionCanvas(canvasRef, { beta, running, generation });

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

        <div className='ml-auto flex items-center gap-3'>
          <label className='text-micro text-ink-faint flex items-center gap-2 font-mono uppercase'>
            <span>beta</span>
            <input
              type='range'
              min={BETA_MIN}
              max={BETA_MAX}
              step={BETA_STEP}
              value={beta}
              onChange={(event) => setBeta(Number(event.target.value))}
              className='h-1 w-20 accent-[var(--signal)]'
              aria-label='Transmission probability per contact'
            />
            <span className='tnum text-meta text-ink normal-case'>{beta.toFixed(3)}</span>
          </label>

          {!reducedMotion && (
            <button
              type='button'
              onClick={() => setRunning((value) => !value)}
              className='chip'
            >
              {running ? 'Pause' : 'Play'}
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

      <figcaption className='border-line text-meta text-ink-muted border-t px-4 py-3'>
        Contact inside a radius transmits with probability <span className='font-mono'>beta</span>. An affected agent
        moves to recovering, then recovered, and a recovered agent can relapse straight back to affected. That relapse
        term is why the system holds at a level instead of burning out — raise <span className='font-mono'>beta</span>{' '}
        and the level moves, not the outcome.
      </figcaption>
    </figure>
  );
}
