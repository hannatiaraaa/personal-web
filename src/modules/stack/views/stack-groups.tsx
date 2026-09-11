import { slugify } from '@/common/lib/slug';
import { stackGroups } from '@/content/stack';

/** Grouped by how current a skill is, not alphabetically. */
export function StackGroups() {
  return (
    <div className='space-y-12'>
      {stackGroups.map((group) => (
        <section
          key={group.title}
          aria-labelledby={slugify(group.title)}
          className='reveal'
        >
          <div className='flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8'>
            <h2
              id={slugify(group.title)}
              className='text-h2 text-ink flex items-center gap-3 font-semibold tracking-[-0.025em]'
            >
              <span
                aria-hidden='true'
                className='from-sky-high to-signal-cyan h-4 w-0.5 rounded-full bg-linear-to-b'
              />
              {group.title}
            </h2>
            <p className='text-meta text-ink-muted max-w-md sm:text-right'>{group.note}</p>
          </div>
          <ul className='mt-5 flex flex-wrap gap-2'>
            {group.items.map((item) => (
              <li
                key={item}
                className='chip'
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
