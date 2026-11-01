import { describe, expect, test } from 'bun:test';
import {
  arrowHead,
  boxAround,
  boxExit,
  chainLinks,
  labelAbove,
  pointsOnLoop,
  spreadAlong,
  trimSegment,
} from './scene-layout';

describe('spreadAlong', () => {
  test('puts the first and last centres on the ends and spaces the rest evenly', () => {
    expect(spreadAlong(4, 40, 280)).toEqual([40, 120, 200, 280]);
  });

  test('centres a single node between the ends', () => {
    expect(spreadAlong(1, 40, 280)).toEqual([160]);
  });

  test('is empty for no nodes', () => {
    expect(spreadAlong(0, 40, 280)).toEqual([]);
  });
});

describe('pointsOnLoop', () => {
  test('starts at the top and runs clockwise', () => {
    const [top, right, bottom, left] = pointsOnLoop(4, { x: 100, y: 100 }, 50);

    expect(top?.x).toBeCloseTo(100, 6);
    expect(top?.y).toBeCloseTo(50, 6);
    expect(right?.x).toBeCloseTo(150, 6);
    expect(right?.y).toBeCloseTo(100, 6);
    expect(bottom?.y).toBeCloseTo(150, 6);
    expect(left?.x).toBeCloseTo(50, 6);
  });

  test('keeps every point on the circle', () => {
    for (const point of pointsOnLoop(5, { x: 0, y: 0 }, 80)) {
      expect(Math.hypot(point.x, point.y)).toBeCloseTo(80, 6);
    }
  });
});

describe('arrowHead', () => {
  test('draws a chevron whose tip is the end point, opening back along the line', () => {
    expect(arrowHead({ x: 0, y: 0 }, { x: 10, y: 0 }, 4)).toBe('M6 -3L10 0L6 3');
  });

  test('turns with the line', () => {
    expect(arrowHead({ x: 0, y: 0 }, { x: 0, y: 10 }, 4)).toBe('M3 6L0 10L-3 6');
  });

  test('is nothing for a line with no length', () => {
    expect(arrowHead({ x: 5, y: 5 }, { x: 5, y: 5 }, 4)).toBe('');
  });
});

describe('boxAround', () => {
  test('centres a box of the given size on the point', () => {
    expect(boxAround({ x: 40, y: 80 }, 60, 30)).toEqual({ x: 10, y: 65, width: 60, height: 30 });
  });
});

describe('trimSegment', () => {
  test('pulls each end in along the line, so an arrow stops short of the nodes it joins', () => {
    const { from, to } = trimSegment({ x: 0, y: 0 }, { x: 0, y: 100 }, 10, 20);

    expect(from).toEqual({ x: 0, y: 10 });
    expect(to).toEqual({ x: 0, y: 80 });
  });

  test('leaves a segment too short to trim where it is', () => {
    const segment = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };

    expect(trimSegment(segment.from, segment.to, 6, 6)).toEqual(segment);
  });
});

describe('labelAbove', () => {
  test('sits midway along the segment, above its higher end', () => {
    expect(labelAbove({ x: 40, y: 80 }, { x: 120, y: 60 }, 6)).toEqual({ x: 80, y: 54 });
  });
});

describe('boxExit', () => {
  test('is the half-width along a level line', () => {
    expect(boxExit({ x: 0, y: 0 }, { x: 100, y: 0 }, 38, 14)).toBeCloseTo(38, 6);
  });

  test('is the half-height along an upright line', () => {
    expect(boxExit({ x: 0, y: 0 }, { x: 0, y: -100 }, 38, 14)).toBeCloseTo(14, 6);
  });

  test('is where a slanted line first crosses an edge', () => {
    // 3-4-5: the line meets the top edge (14 up) before the side (38 across).
    expect(boxExit({ x: 0, y: 0 }, { x: 30, y: 40 }, 38, 14)).toBeCloseTo(17.5, 6);
  });
});

describe('chainLinks', () => {
  const row = [
    { x: 40, y: 50 },
    { x: 120, y: 50 },
    { x: 200, y: 50 },
  ];

  test('joins each node to the next, stopping a margin short of both boxes', () => {
    expect(chainLinks(row, { halfWidth: 30, halfHeight: 20, margin: 2 })).toEqual([
      { from: { x: 72, y: 50 }, to: { x: 88, y: 50 } },
      { from: { x: 152, y: 50 }, to: { x: 168, y: 50 } },
    ]);
  });

  test('closes a loop back to the first node when asked', () => {
    const links = chainLinks(row, { halfWidth: 30, halfHeight: 20, margin: 2, isClosed: true });

    expect(links).toHaveLength(3);
    expect(links[2]).toEqual({ from: { x: 168, y: 50 }, to: { x: 72, y: 50 } });
  });

  test('has nothing to join for a single node', () => {
    expect(chainLinks([{ x: 0, y: 0 }], { halfWidth: 30, halfHeight: 20, margin: 2 })).toEqual([]);
  });
});
