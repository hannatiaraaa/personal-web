'use client';

// Client: observes which step is in the reading band; the visual and steps stay server-rendered.

import { useRef, type ReactNode } from 'react';
import { useActiveStep } from '@/common/hooks/use-active-step';
import { useMediaQuery } from '@/common/hooks/use-media-query';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { PIN_QUERY } from '@/common/lib/media-queries';

type Props = {
  /** Names the story for assistive tech, e.g. "How the release gate was built". */
  label: string;
  /** The pinned visual. Keys its state off the stage's `data-active-step`. */
  visual: ReactNode;
  /** The text steps, in reading order. Each is one scroll beat. */
  steps: readonly ReactNode[];
  /** Which side the visual sits on once the stage pins. */
  visualSide?: 'start' | 'end';
  className?: string;
};

/**
 * A pinned visual beside steps that scroll past it.
 *
 * The active step is written as `data-active-step` on the stage and
 * `aria-current="step"` on the step; visuals restyle in CSS off the attribute,
 * so a step change never re-renders them. Under reduced motion nothing pins and
 * visuals show their final state. Below the `pin` variant each area lays the
 * story out in plain flow, its own drawing in each step: the step reached then
 * only plays each drawing in once, and no step is marked current.
 */
export function ScrollyStage({ label, visual, steps, visualSide = 'start', className = '' }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isPinned = useMediaQuery(PIN_QUERY);
  const active = useActiveStep(stageRef);

  return (
    <div
      ref={stageRef}
      role='group'
      aria-label={label}
      data-active-step={active}
      data-stage-state={reduced ? 'final' : 'live'}
      data-visual-side={visualSide}
      className={`scrolly-stage group/stage ${className}`}
    >
      <div className='scrolly-visual'>{visual}</div>
      <div className='scrolly-steps'>
        {steps.map((step, index) => (
          <div
            // Steps are a fixed, server-rendered list; position is their identity.
            key={index}
            data-step={index}
            // In flow the step only latches each card's entrance; none of them is "current".
            aria-current={isPinned && active === index ? 'step' : undefined}
            className='scrolly-step'
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
