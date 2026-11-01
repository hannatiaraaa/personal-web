'use client';

// Client: the reader asks for another fact, and the card knows when the pool is still.

import type { CSSProperties } from 'react';
import { heroFact, type HeroFact } from '@/content/hero';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { useFunFact } from '@/modules/home/hooks/use-fun-fact';

/** The arrows turn once per new fact; how far is in fun-fact.css. */
function ShuffleIcon({ turn }: { turn: number }) {
  const style: CSSProperties & Record<'--turn', number> = { '--turn': turn };
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      className='fun-fact-shuffle size-4'
      style={style}
    >
      <path
        d='M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6M18 3v4h-4M6 21v-4h4'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='size-3'
    >
      <path
        d='M8 0.5l1.9 5.6 5.6 1.9-5.6 1.9L8 15.5l-1.9-5.6L0.5 8l5.6-1.9z'
        fill='currentColor'
      />
    </svg>
  );
}

/**
 * One true thing about the pool behind the name, and a button for another.
 * The fact is announced politely only when the reader asks for it; on load it
 * is simply read in place.
 */
export function FunFactCard({ facts }: { facts: readonly HeroFact[] }) {
  const { index, turn, showNext } = useFunFact(facts.length);
  const isReduced = useReducedMotion();
  const fact = facts[index];
  if (!fact) return null;

  // Keyed by the turn so a new fact mounts fresh and plays its entrance; the
  // first one is server HTML and does not.
  const enter = turn > 0 ? ' fun-fact-enter' : '';

  return (
    <aside
      aria-label={heroFact.regionLabel}
      className='fun-fact card p-5'
    >
      <div className='flex items-center justify-between gap-3'>
        <p className='fun-fact-badge'>
          <SparkIcon />
          {heroFact.label}
        </p>
        <p className='legend tnum'>
          {index + 1} / {facts.length}
        </p>
      </div>

      <div
        aria-live='polite'
        className='mt-4'
      >
        <p
          key={`text-${turn}`}
          className={`text-meta text-ink text-pretty${enter}`}
        >
          {fact.text}
        </p>
        {fact.formula && (
          <p
            key={`formula-${turn}`}
            className={`text-micro text-ink-faint mt-2.5 font-mono${enter}`}
          >
            {fact.formula}
          </p>
        )}
      </div>

      <div className='mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
        <button
          type='button'
          className='chip fun-fact-next text-signal'
          onClick={showNext}
        >
          <ShuffleIcon turn={turn} />
          {heroFact.next}
        </button>
        {isReduced && <p className='text-micro text-ink-faint'>{heroFact.still}</p>}
      </div>
    </aside>
  );
}
