'use client';

// Client: holds the policy and replay clock. Lazy-loaded by DraftSyncMount, so not in First Load JS.

import { useRef } from 'react';
import { ScrollScene } from '@/common/components/scroll-scene';
import { useMediaQuery } from '@/common/hooks/use-media-query';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { useDraftSyncPlayback } from '@/modules/visual/hooks/use-draft-sync-playback';
import { draftSyncBeats } from '@/modules/visual/lib/draft-sync-drawing';
import { DraftSyncControls } from './draft-sync-controls';
import { DraftSyncFigure } from './draft-sync-figure';

const BEATS = draftSyncBeats();

export function DraftSyncSimulator({ reported }: { reported: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isPinned = useMediaQuery(PIN_QUERY);
  const { policy, steps, beat, run, announcement, hasMoved, isRunning, selectPolicy, replay, skip } =
    useDraftSyncPlayback({ frameRef, stageRef, isPinned });

  // Scrubbed by scroll only where the frame pins beside its log; elsewhere the
  // scene is still and the run plays on the clock as it comes into view.
  return (
    <ScrollScene
      mode='pinned'
      beats={BEATS}
      liveQuery={PIN_QUERY}
      className='draft-sync-scene'
    >
      <DraftSyncFigure
        frameRef={frameRef}
        stageRef={stageRef}
        steps={steps}
        beat={beat}
        policy={policy}
        run={`${policy}-${beat}-${run}`}
        reported={reported}
        announcement={announcement}
        status='live'
        isFirstFrame={!hasMoved}
        controls={
          <DraftSyncControls
            policy={policy}
            onSelect={selectPolicy}
            onReplay={replay}
            onSkip={skip}
            isRunning={isRunning}
          />
        }
      />
    </ScrollScene>
  );
}
