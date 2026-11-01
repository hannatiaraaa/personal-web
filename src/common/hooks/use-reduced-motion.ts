'use client';

// Client: a hook — React state and effects, used only by client components.

import { REDUCED_MOTION_QUERY } from '@/common/lib/media-queries';
import { useMediaQuery } from './use-media-query';

/**
 * Whether the visitor has asked for reduced motion. Callers honour it by not
 * running a loop at all, not by running one slower.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
