'use client';

// Client: follows the enclosing scroll stage's active step and hands it to the model.

import { useRef } from 'react';
import { useMediaQuery } from '@/common/hooks/use-media-query';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { useStageStep } from '@/modules/visual/hooks/use-stage-step';
import { contagionWalkAt } from '@/modules/visual/lib/contagion-walk';
import { ContagionField } from './contagion-field';

/**
 * The contagion figure as the visual of a scroll stage: each step of the
 * stage sets the model's parameters, until the visitor touches a control.
 * Only where the stage pins, so the model stays in view beside the steps it
 * follows; below that (where the steps are not shown), outside a stage, or
 * under reduced motion, it is the plain figure. The server and the first
 * render are the plain figure too, so nothing steers before the query is read.
 */
export function GuidedContagionField() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const step = useStageStep(anchorRef);
  const isPinned = useMediaQuery(PIN_QUERY);

  return (
    <div ref={anchorRef}>
      <ContagionField walk={isPinned && step !== null ? contagionWalkAt(step) : null} />
    </div>
  );
}
