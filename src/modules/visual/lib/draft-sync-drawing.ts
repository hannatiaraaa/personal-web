import { DRAFT_SYNC_STEP_COUNT, type SyncMessage } from './draft-sync';

/**
 * Geometry of the simulator's drawing, in viewBox units, and where each step
 * sits on the scene's scroll. The server sits on top, the two tablets float on
 * the sea below it, and each tablet has one link up to the server. A message
 * travels along its link; a rejected one stops at the guard point, short of the
 * server, and falls back.
 */

export const DRAFT_SYNC_VIEW = { width: 480, height: 400 } as const;

export type DrawingPoint = { readonly x: number; readonly y: number };

export const DRAFT_SYNC_SERVER = { x: 146, y: 16, w: 188, h: 116 } as const;
export const DRAFT_SYNC_TABLETS = {
  A: { x: 20, y: 230, w: 134, h: 118 },
  B: { x: 326, y: 230, w: 134, h: 118 },
} as const;
export const DRAFT_SYNC_LINKS = {
  A: { tablet: { x: 110, y: 188 }, server: { x: 200, y: 132 }, guard: { x: 182, y: 143 }, cut: { x: 155, y: 160 } },
  B: { tablet: { x: 370, y: 188 }, server: { x: 280, y: 132 }, guard: { x: 298, y: 143 }, cut: { x: 325, y: 160 } },
} as const;
export const DRAFT_SYNC_STAMP = { x: 158, y: 240, w: 164, h: 62 } as const;
export const DRAFT_SYNC_TIMELINE_Y = 326;

const TIMELINE_PITCH = 20;

/**
 * The steps spread evenly over the pinned scene's scroll up to this point,
 * leaving the last one room to rest. Below `pin` the run plays on a clock
 * instead (use-draft-sync-playback.ts), so there is no flow layout of beats.
 */
const LAST_BEAT = 0.72;

/** The pinned scene's beat starts, one per step. */
export function draftSyncBeats(): readonly number[] {
  const last = DRAFT_SYNC_STEP_COUNT - 1;
  return Array.from({ length: DRAFT_SYNC_STEP_COUNT }, (_, index) => (index * LAST_BEAT) / last);
}

/** The x of step `index`'s dot on the timeline, the row centred in the drawing. */
export function timelineDotX(index: number): number {
  const span = (DRAFT_SYNC_STEP_COUNT - 1) * TIMELINE_PITCH;
  return DRAFT_SYNC_VIEW.width / 2 - span / 2 + index * TIMELINE_PITCH;
}

/** The stretch of link a message travels, or null for one with no link to travel. */
export function packetPath(message: SyncMessage): { from: DrawingPoint; to: DrawingPoint } | null {
  if (message.from === 'server') {
    if (message.to === 'server') return null;
    const link = DRAFT_SYNC_LINKS[message.to];
    return { from: link.server, to: link.tablet };
  }
  const link = DRAFT_SYNC_LINKS[message.from];
  return { from: link.tablet, to: message.delivery === 'rejected' ? link.guard : link.server };
}
