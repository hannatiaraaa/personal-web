import type { StackGroup } from '@/content/stack';
import { StackScene } from './scenes/stack-scene';

type Props = {
  groups: readonly StackGroup[];
};

/**
 * Every group's scene in one cell of the pinned panel. CSS shows the one whose
 * beat the scene is on and hides the rest from sight and from assistive tech,
 * so a reader meets one scene at a time (stack-story.css).
 */
export function StackScenePanel({ groups }: Props) {
  return (
    <div className='stack-story-scenes'>
      {groups.map((group, index) => (
        <div
          key={group.id}
          data-group={index}
          className='stack-story-scene'
        >
          <StackScene id={group.id} />
        </div>
      ))}
    </div>
  );
}
