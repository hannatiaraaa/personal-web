import type { ReactNode } from 'react';

type Props = {
  /** The finished picture, server-rendered; hidden once the canvas has painted. */
  still: ReactNode;
  stamp: ReactNode;
  counter: ReactNode;
  canvas?: ReactNode;
  control?: ReactNode;
  isPainted?: boolean;
};

/**
 * The gate run's box and the row under it. Shared by the static stand-in and
 * the live canvas so the two are the same size and nothing shifts on swap.
 */
export function GateRunStageFrame({ still, stamp, counter, canvas, control, isPainted = false }: Props) {
  return (
    <div className='gate-run-stage'>
      <div
        className='gate-run-box'
        data-painted={isPainted ? 'true' : undefined}
      >
        <div className='gate-run-still'>{still}</div>
        {canvas}
        {stamp}
      </div>
      <div className='gate-run-foot'>
        {counter}
        <div className='gate-run-control'>{control}</div>
      </div>
    </div>
  );
}
