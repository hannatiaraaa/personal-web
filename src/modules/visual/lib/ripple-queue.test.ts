import { describe, expect, test } from 'bun:test';
import { RippleQueue } from './ripple-queue';

describe('RippleQueue', () => {
  test('hands out slots in order', () => {
    const queue = new RippleQueue(3, 1);

    expect(queue.place({ x: 0, z: 0 }, true)?.index).toBe(0);
    expect(queue.place({ x: 0, z: 0 }, true)?.index).toBe(1);
    expect(queue.place({ x: 0, z: 0 }, true)?.index).toBe(2);
  });

  test('recycles the oldest slot once it is full', () => {
    const queue = new RippleQueue(2, 1);

    queue.place({ x: 0, z: 0 }, true);
    queue.place({ x: 0, z: 0 }, true);

    expect(queue.place({ x: 0, z: 0 }, true)?.index).toBe(0);
  });

  test('carries the position through to the slot', () => {
    const slot = new RippleQueue().place({ x: 1.5, z: -2.25 }, true);

    expect(slot).toMatchObject({ x: 1.5, z: -2.25 });
  });

  test('a deliberate press always lands, however close to the last one', () => {
    const queue = new RippleQueue(4, 5);

    expect(queue.place({ x: 0, z: 0 }, true)).not.toBeNull();
    expect(queue.place({ x: 0.01, z: 0 }, true)).not.toBeNull();
  });

  test('a drag is ignored until it has travelled the spacing', () => {
    const queue = new RippleQueue(4, 1);
    queue.place({ x: 0, z: 0 }, true);

    expect(queue.place({ x: 0.5, z: 0 }, false)).toBeNull();
    expect(queue.place({ x: 1.2, z: 0 }, false)).not.toBeNull();
  });

  test('spacing is measured from the last ripple placed, not the first', () => {
    const queue = new RippleQueue(4, 1);
    queue.place({ x: 0, z: 0 }, true);
    queue.place({ x: 1.2, z: 0 }, false);

    // 0.4 from the new origin, so still too close even though it is 1.6 from 0.
    expect(queue.place({ x: 1.6, z: 0 }, false)).toBeNull();
    expect(queue.place({ x: 2.4, z: 0 }, false)).not.toBeNull();
  });

  test('the first drag lands, because there is nothing to measure against', () => {
    expect(new RippleQueue(4, 99).place({ x: 0, z: 0 }, false)).not.toBeNull();
  });
});
