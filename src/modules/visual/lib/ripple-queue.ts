import { MAX_RIPPLES, RIPPLE_SPACING } from './flow-field';
import type { GroundHit } from './pointer-plane';

/**
 * The fixed set of live ripples: a ring buffer, because the shader loops over a
 * constant number of slots. The oldest ripple is overwritten. Decides whether
 * and where; uploading is the hook's job.
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
   * Claims a slot for a touch, or `null` to ignore it. A press always lands; a
   * drag lands every `spacing`, so it leaves distinct rings rather than one smear.
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
