import type { CSSProperties } from 'react';
import { ScrollScene } from '@/common/components/scroll-scene';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { stackGroups } from '@/content/stack';
import { buildStackBeats, stackTravelSvh, type StackStoryLayout } from '../lib';
import { StackGroupStep } from './stack-group-step';
import { StackScenePanel } from './stack-scene-panel';
import { StackStoryIndex } from './stack-story-index';

/**
 * A step of most of a screen per group. The reading line sits low, so a group
 * takes the panel as it comes into view and keeps it until it nears the top,
 * and the last group's scene holds while its card is still on screen.
 */
const LAYOUT: StackStoryLayout = { stepSvh: 62, leadSvh: 16, readingLineSvh: 66, tailSvh: 18 };

type StoryStyle = CSSProperties & Record<`--${string}`, number | string>;

/** Without scripts nothing drives the panel, so each card carries its own finished scene, in flow. */
const NO_SCRIPT_CSS =
  '.stack-story{--progress:1!important;grid-template-columns:minmax(0,1fr)!important}.stack-story-visual{display:none!important}.stack-story-card-scene{display:block!important}.stack-story-step{min-height:0!important}.stack-story-groups{padding-block:0!important}';

/**
 * The skills library, each group with a scene that explains it. Where the
 * screen can hold it, a panel pins beside the groups and draws each group's
 * scene as its step crosses the reading line. Below that, and without motion
 * or scripts, each group's card carries its own scene. Every item is rendered
 * once, as text in its group's list.
 */
export function StackStory() {
  const count = stackGroups.length;
  const style: StoryStyle = {
    // Server-rendered at the scene's start: a reader with scripts arrives at the
    // first group, so the last group's scene flashing before hydration would be wrong.
    // Reduced motion (scrolly.css) and `noscript` force the end instead.
    '--progress': 0,
    '--stack-count': count,
    '--stack-travel': stackTravelSvh(count, LAYOUT),
    '--stack-step': LAYOUT.stepSvh,
    '--stack-lead': LAYOUT.leadSvh,
    '--stack-line': LAYOUT.readingLineSvh,
    '--stack-tail': LAYOUT.tailSvh,
  };

  return (
    <>
      <ScrollScene
        mode='pinned'
        beats={buildStackBeats(count, LAYOUT)}
        liveQuery={PIN_QUERY}
        initialBeat={0}
        label='The stack, group by group'
        className='stack-story'
        style={style}
      >
        <div className='stack-story-visual'>
          <StackStoryIndex groups={stackGroups} />
          <StackScenePanel groups={stackGroups} />
        </div>

        <div className='stack-story-groups'>
          {stackGroups.map((group, index) => (
            <StackGroupStep
              key={group.id}
              group={group}
              index={index}
              count={count}
            />
          ))}
        </div>
      </ScrollScene>
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
    </>
  );
}
