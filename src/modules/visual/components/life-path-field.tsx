'use client';

// Client because it owns a WebGL context, a frame loop and the stage controls.

import { useCallback, useRef, useState } from 'react';
import { lifeStages } from '@/content/life-path';
import { useLifePathScene } from '@/modules/visual/hooks/use-life-path-scene';

/**
 * The hero: one lattice of points taking the three shapes of the work in turn —
 * a harvested Fisher–Kolmogorov front, a double helix, ocean swell.
 *
 * The story plays on its own, and the labels below are buttons, so anyone who
 * wants to stop on one shape can. Naming each shape is what makes the sequence
 * legible; without the labels it is a pretty animation about nothing.
 */
export function LifePathField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [pinnedStage, setPinnedStage] = useState<number | null>(null);

  const onStageChange = useCallback((stage: number) => setActiveStage(stage), []);
  const { reducedMotion, pointCount } = useLifePathScene(canvasRef, { pinnedStage, onStageChange });

  const stage = lifeStages[activeStage] ?? lifeStages[0]!;

  return (
    <div className='flex flex-col gap-6'>
      <div className='relative'>
        <canvas
          ref={canvasRef}
          className='block h-[17rem] w-full sm:h-[23rem]'
          role='img'
          aria-label={`A field of ${pointCount.toLocaleString('en')} points that takes three shapes in turn: a travelling reaction-diffusion front, a DNA double helix, and ocean swell. Currently showing ${stage.shape.toLowerCase()}.`}
        />
      </div>

      {/* The labels are the story. Announced as a live region so a screen
          reader follows the shape rather than only seeing the initial state. */}
      <div>
        <ul className='flex flex-wrap gap-2'>
          {lifeStages.map((item, index) => {
            const isActive = index === activeStage;
            const isPinned = index === pinnedStage;

            return (
              <li key={item.id}>
                <button
                  type='button'
                  onClick={() => setPinnedStage(isPinned ? null : index)}
                  aria-pressed={isPinned}
                  className={`flex flex-col items-start rounded-[var(--radius-sm)] border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border-signal bg-signal-wash text-ink'
                      : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
                  }`}
                >
                  <span className='text-micro tnum font-mono'>{item.period}</span>
                  <span className='text-meta font-medium'>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p
          aria-live='polite'
          className='text-meta text-ink-muted mt-4 max-w-2xl'
        >
          <span className='text-ink font-medium'>{stage.shape}.</span> {stage.detail}
        </p>

        <p className='text-micro text-ink-faint mt-3 font-mono'>
          {pinnedStage === null
            ? reducedMotion
              ? 'Still frame — motion is switched off in your settings. Pick a stage to change shape.'
              : 'Playing · pick a stage to hold it'
            : 'Held · pick it again to resume'}
        </p>
      </div>
    </div>
  );
}
