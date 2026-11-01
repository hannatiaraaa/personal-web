import type { CSSProperties } from 'react';
import { slugify } from '@/common/lib/slug';
import type { StackGroup } from '@/content/stack';
import { formatGroupIndex } from '../lib';
import { StackScene } from './scenes/stack-scene';

type StepStyle = CSSProperties & Record<'--i', number>;
type ChipStyle = CSSProperties & Record<'--k', number>;

type Props = {
  group: StackGroup;
  /** The group's place in the content, which is its beat in the scene. */
  index: number;
  count: number;
};

/** A chip's place in its group, which staggers its entrance. */
function chipStyle(position: number): ChipStyle {
  return { '--k': position };
}

/** A run of chips. Each list staggers from its own start, so subgroups land together. */
function ChipList({ items, className }: { items: readonly string[]; className: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, position) => (
        <li
          key={item}
          className='chip stack-story-chip'
          style={chipStyle(position)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * One group: its heading, its note and its items, as the content has them.
 * A step of the scroll beside the pinned scene; below that, or without motion
 * or scripts, a card in flow carrying its own scene.
 */
export function StackGroupStep({ group, index, count }: Props) {
  const id = slugify(group.title);
  const style: StepStyle = { '--i': index };

  return (
    <section
      aria-labelledby={id}
      className='stack-story-step'
      style={style}
    >
      <div className='stack-story-group card'>
        <p
          aria-hidden='true'
          className='legend stack-story-step-index tnum'
        >
          {formatGroupIndex(index + 1, count)}
        </p>
        <h2
          id={id}
          className='text-h2 text-ink mt-1 font-semibold tracking-[-0.025em]'
        >
          {group.title}
        </h2>
        <p className='text-meta text-ink-muted mt-3 max-w-xl'>{group.note}</p>
        <div className='stack-story-card-scene'>
          <StackScene id={group.id} />
        </div>
        {group.subgroups ? (
          <div className='mt-5 space-y-4'>
            {group.subgroups.map((subgroup) => (
              <div key={subgroup.title}>
                <h3 className='legend stack-story-subgroup-title'>{subgroup.title}</h3>
                <ChipList
                  items={subgroup.items}
                  className='mt-2'
                />
              </div>
            ))}
          </div>
        ) : (
          <ChipList
            items={group.items}
            className='mt-5'
          />
        )}
      </div>
    </section>
  );
}
