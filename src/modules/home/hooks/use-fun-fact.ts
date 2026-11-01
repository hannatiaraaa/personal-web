'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useState } from 'react';
import { nextFactIndex } from '@/modules/home/lib/fun-fact';

type FunFact = {
  /** The fact on show. */
  readonly index: number;
  /** How many times the reader has asked for another; 0 until they first do. */
  readonly turn: number;
  readonly showNext: () => void;
};

/** Which of `count` facts is showing, moved on only when the reader asks. */
export function useFunFact(count: number): FunFact {
  const [state, setState] = useState({ index: 0, turn: 0 });

  const showNext = useCallback(() => {
    setState((previous) => ({ index: nextFactIndex(previous.index, count), turn: previous.turn + 1 }));
  }, [count]);

  return { index: state.index, turn: state.turn, showNext };
}
