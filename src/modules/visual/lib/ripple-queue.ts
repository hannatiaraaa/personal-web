import { MAX_RIPPLES, RIPPLE_SPACING } from './flow-field';
import type { GroundHit } from './pointer-plane';

/**
 * The fixed set of live ripples.
 *
 * A ring buffer rather than a list: the shader loops over a constant number of
 * slots, so the queue's size is a GPU constraint and not a policy choice. The
 * oldest ripple is the one overwritten.
 *
 * Pure bookkeeping — it decides *whether* and *where*, and returns the slot to
 * write. Uploading the record is the hook's job.
 */

export type RippleSlot = {
  readonly index: number;
  readonly x: number;
  readonly z: number;
};

export class RippleQueue {
  private next = 0;
  private last: GroundHit | null = null;

  constructor(
    private readonly size: number = MAX_RIPPLES,
    private readonly spacing: number = RIPPLE_SPACING,
  ) {}

  /**
   * Claims a slot for a touch, or returns `null` to ignore it.
   *
   * A deliberate press always lands. A drag only lands once it has travelled
   * `spacing`, so moving a pointer draws a trail of distinct rings instead of
   * one smear that overwrites itself every frame.
   */
  place(hit: GroundHit, deliberate: boolean): RippleSlot | null {
    if (!deliberate && this.last && Math.hypot(hit.x - this.last.x, hit.z - this.last.z) < this.spacing) {
      return null;
    }

    const index = this.next;
    this.next = (this.next + 1) % this.size;
    this.last = hit;

    return { index, x: hit.x, z: hit.z };
  }
}
