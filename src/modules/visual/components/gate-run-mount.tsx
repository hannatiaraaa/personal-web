'use client';

// Client: decides from the viewport when to fetch the canvas chunk.

import dynamic from 'next/dynamic';
import { useRef, type ReactNode } from 'react';
import { useLatchedInViewport } from '@/common/hooks/use-latched-in-viewport';
import { GateRunCounter } from './gate-run-counter';
import { GateRunStageFrame } from './gate-run-stage-frame';

/** A screen ahead, so the canvas is drawing before the figure arrives. */
const ARM_MARGIN = '100% 0px';

const LiveCanvas = dynamic(() => import('./gate-run-canvas').then((module) => module.GateRunCanvas), {
  ssr: false,
});

type Props = {
  still: ReactNode;
  stamp: ReactNode;
  finalCounter: string;
  description: string;
};

/**
 * The static stand-in stays in flow and sizes the box; the live canvas is laid
 * over it once loaded, and the stand-in is hidden in CSS only after the canvas
 * has painted — so there is no shift and no blank frame while the chunk loads.
 */
export function GateRunMount(props: Props) {
  const { still, stamp, finalCounter } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const isArmed = useLatchedInViewport(anchor, ARM_MARGIN);

  return (
    <div
      ref={anchor}
      className='gate-run-mount'
    >
      <div className='gate-run-standin'>
        <GateRunStageFrame
          still={still}
          stamp={stamp}
          counter={<GateRunCounter text={finalCounter} />}
        />
      </div>
      {isArmed && (
        <div className='gate-run-live'>
          <LiveCanvas {...props} />
        </div>
      )}
    </div>
  );
}
