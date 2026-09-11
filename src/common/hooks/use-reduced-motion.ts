'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the visitor has asked for reduced motion.
 *
 * Starts `false` so the server and the first client render agree; the effect
 * corrects it before anything animates. Callers honour it by not running a
 * loop at all, not by running one slower.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
