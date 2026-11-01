import type { Page } from '@playwright/test';

export type StoryMode = 'pinned' | 'in-flow';

/**
 * The approved behaviour, written out by hand: at each screen size, whether the
 * scroll stories pin and are scrubbed by scroll, or sit in flow and play by
 * themselves. It is the requirement, not a copy of the code, so it never reads
 * a threshold from `src/`. Change it only with Hanna's approval.
 *
 * Approved 2026-11-01: the rule is width-only. Every width from 1024 up pins
 * at any height (a short window, a docked DevTools, a landscape tablet at
 * 1024×768); every width below 1024 (phones, landscape phones, portrait
 * tablets) is in flow.
 */
export const APPROVED_MODES = [
  { w: 320, h: 568, expect: 'in-flow' },
  { w: 320, h: 640, expect: 'in-flow' },
  { w: 360, h: 640, expect: 'in-flow' },
  { w: 390, h: 664, expect: 'in-flow' },
  { w: 390, h: 844, expect: 'in-flow' },
  { w: 412, h: 839, expect: 'in-flow' },
  { w: 768, h: 1024, expect: 'in-flow' },
  { w: 844, h: 390, expect: 'in-flow' },
  { w: 1023, h: 800, expect: 'in-flow' },
  { w: 1024, h: 600, expect: 'pinned' },
  { w: 1024, h: 640, expect: 'pinned' },
  { w: 1024, h: 768, expect: 'pinned' },
  { w: 1280, h: 600, expect: 'pinned' },
  { w: 1280, h: 720, expect: 'pinned' },
  { w: 1280, h: 800, expect: 'pinned' },
  { w: 1366, h: 768, expect: 'pinned' },
  { w: 1440, h: 560, expect: 'pinned' },
  { w: 1440, h: 800, expect: 'pinned' },
  { w: 1440, h: 900, expect: 'pinned' },
  { w: 1536, h: 864, expect: 'pinned' },
  { w: 1920, h: 1080, expect: 'pinned' },
  { w: 2000, h: 600, expect: 'pinned' },
  { w: 2000, h: 700, expect: 'pinned' },
  { w: 2000, h: 1100, expect: 'pinned' },
] as const satisfies readonly { w: number; h: number; expect: StoryMode }[];

/** The approved mode for a size; a size missing from the table is a test to write, not a guess. */
export function approvedMode(width: number, height: number): StoryMode {
  const row = APPROVED_MODES.find((entry) => entry.w === width && entry.h === height);
  if (!row) throw new Error(`${width}×${height} has no approved mode in e2e/support/approved-modes.ts`);
  return row.expect;
}

/** Whether the stories should pin on this page's screen, by the approved table. */
export function shouldPin(page: Page): boolean {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('no viewport');
  return approvedMode(viewport.width, viewport.height) === 'pinned';
}
