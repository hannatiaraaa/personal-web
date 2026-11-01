'use client';

// Client: draws to a canvas and owns the run's clock. Lazy-loaded by GateRunMount.

import { useRef, type ReactNode } from 'react';
import { useGateRunCanvas } from '@/modules/visual/hooks/use-gate-run-canvas';
import { GateRunCounter } from './gate-run-counter';
import { GateRunStageFrame } from './gate-run-stage-frame';

type Props = {
  still: ReactNode;
  stamp: ReactNode;
  finalCounter: string;
  description: string;
};

export function GateRunCanvas({ still, stamp, finalCounter, description }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const { isPlayer, isPlaying, isPainted, play, finish } = useGateRunCanvas(canvasRef, counterRef);

  return (
    <GateRunStageFrame
      still={still}
      stamp={stamp}
      isPainted={isPainted}
      counter={
        <GateRunCounter
          ref={counterRef}
          text={finalCounter}
        />
      }
      canvas={
        <canvas
          ref={canvasRef}
          role='img'
          aria-label={description}
          className='gate-run-canvas font-mono'
        />
      }
      control={
        isPlayer && (
          <button
            type='button'
            onClick={isPlaying ? finish : play}
            className='gate-run-replay press'
          >
            {isPlaying ? 'Skip to the result' : 'Replay the run'}
          </button>
        )
      }
    />
  );
}
