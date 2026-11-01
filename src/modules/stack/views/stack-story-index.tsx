import type { CSSProperties } from 'react';
import type { StackGroup } from '@/content/stack';
import { formatGroupIndex } from '../lib';

type LabelStyle = CSSProperties & Record<'--i', number>;

type Props = {
  groups: readonly StackGroup[];
};

function labelStyle(index: number): LabelStyle {
  return { '--i': index };
}

/**
 * Which group the scroll is on, over the pinned scene: `03 / 06 · Domain`, and
 * a rail for the way through. One label per group shares a cell; CSS shows the
 * one the scene is on. Hidden from assistive tech, which reads the headings
 * themselves.
 */
export function StackStoryIndex({ groups }: Props) {
  const count = groups.length;

  return (
    <div
      aria-hidden='true'
      className='stack-story-index'
    >
      <p className='stack-story-index-labels'>
        {groups.map((group, index) => (
          <span
            key={group.title}
            className='stack-story-index-label'
            style={labelStyle(index)}
          >
            <span className='tnum text-signal'>{formatGroupIndex(index + 1, count)}</span>
            <span className='text-ink-faint'> · </span>
            {group.title}
          </span>
        ))}
      </p>
      <span className='stack-story-index-rail'>
        <span className='stack-story-index-fill' />
      </span>
    </div>
  );
}
