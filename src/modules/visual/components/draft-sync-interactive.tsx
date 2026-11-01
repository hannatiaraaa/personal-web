import type { ReactNode } from 'react';
import { simulateDraftSync } from '@/modules/visual/lib/draft-sync';
import { DraftSyncControls } from './draft-sync-controls';
import { DraftSyncFigure } from './draft-sync-figure';
import { DraftSyncMount } from './draft-sync-mount';

type Props = {
  reported: string;
  /** What a reader without JavaScript sees instead: the static mechanism diagram. */
  fallback?: ReactNode;
};

/**
 * The offline sync simulator, server side. Until it loads, the server renders
 * the simulator's own frame in its finished state, so the swap never moves the
 * page. Without JavaScript that frame could never come alive, so a
 * `(scripting: none)` reader gets the static draft-ownership diagram instead.
 */
export function DraftSyncInteractive({ reported, fallback }: Props) {
  const steps = simulateDraftSync('last-write-wins');
  const placeholder = (
    <div className='draft-sync-scene'>
      <DraftSyncFigure
        steps={steps}
        beat={steps.length - 1}
        policy='last-write-wins'
        run='static'
        reported={reported}
        status='static'
        controls={<DraftSyncControls policy='last-write-wins' />}
      />
    </div>
  );

  return (
    <div className='draft-sync'>
      <div className='draft-sync-js'>
        <DraftSyncMount
          reported={reported}
          placeholder={placeholder}
        />
      </div>
      {fallback && <div className='draft-sync-nojs'>{fallback}</div>}
    </div>
  );
}
