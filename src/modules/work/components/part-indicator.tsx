'use client';

// Client: follows the reader through the parts (useActiveStep); the parts stay server-rendered.

import { useRef, type ReactNode } from 'react';
import { useActiveStep } from '@/common/hooks/use-active-step';
import { listCaseStudyParts } from '@/modules/work/lib/case-study-parts';

const PARTS = listCaseStudyParts();

/**
 * The four parts of a case study, with a navigation marking the one being read.
 * A rail beside the parts where it pins, a short bar under the site header
 * below that (`scrolly-work.css`). In-page links, so the current part is
 * `aria-current="location"`, not a step. Following a link focuses the part's
 * heading, which activates the part until the reader next scrolls by hand.
 */
export function PartIndicator({ children }: { children: ReactNode }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const active = useActiveStep(storyRef);

  return (
    <div
      ref={storyRef}
      className='part-story'
    >
      <nav
        aria-label='Case study parts'
        className='part-nav'
      >
        <ol className='part-nav-list'>
          {PARTS.map((part) => (
            <li key={part.key}>
              <a
                href={`#${part.id}`}
                aria-current={active === part.step ? 'location' : undefined}
                className='part-nav-link'
              >
                {part.short}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className='space-y-12'>{children}</div>
    </div>
  );
}
