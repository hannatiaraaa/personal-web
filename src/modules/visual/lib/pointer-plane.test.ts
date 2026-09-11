import { describe, expect, test } from 'bun:test';
import { intersectGroundPlane, unrotateY } from './pointer-plane';

describe('intersectGroundPlane', () => {
  test('finds the crossing for a ray aimed at the plane', () => {
    const hit = intersectGroundPlane({ x: 0, y: 4, z: 8 }, { x: 0, y: -1, z: -1 });

    expect(hit).toEqual({ x: 0, z: 4 });
  });

  test('carries the ray sideways as it descends', () => {
    const hit = intersectGroundPlane({ x: 1, y: 2, z: 0 }, { x: 0.5, y: -1, z: 0.25 });

    expect(hit?.x).toBeCloseTo(2, 10);
    expect(hit?.z).toBeCloseTo(0.5, 10);
  });

  test('refuses a ray running parallel to the plane', () => {
    expect(intersectGroundPlane({ x: 0, y: 3, z: 0 }, { x: 1, y: 0, z: 0 })).toBeNull();
  });

  test('refuses a hit behind the camera', () => {
    // Above the plane, pointing up: the crossing is behind the origin.
    expect(intersectGroundPlane({ x: 0, y: 3, z: 0 }, { x: 0, y: 1, z: 0 })).toBeNull();
  });
});

describe('unrotateY', () => {
  test('leaves a hit alone when nothing has spun', () => {
    expect(unrotateY({ x: 1.5, z: -2 }, 0)).toEqual({ x: 1.5, z: -2 });
  });

  test('undoes the spin, so the round trip returns the original point', () => {
    const spun = { x: 2, z: 0.5 };
    const angle = 0.9;

    const back = unrotateY(spun, angle);
    const forward = unrotateY(back, -angle);

    expect(forward.x).toBeCloseTo(spun.x, 10);
    expect(forward.z).toBeCloseTo(spun.z, 10);
  });

  test('preserves distance from the centre, because a rotation must', () => {
    const hit = { x: 3, z: -1 };
    const rotated = unrotateY(hit, 1.7);

    expect(Math.hypot(rotated.x, rotated.z)).toBeCloseTo(Math.hypot(hit.x, hit.z), 10);
  });

  test('a quarter turn maps the x axis onto the z axis', () => {
    const rotated = unrotateY({ x: 1, z: 0 }, Math.PI / 2);

    expect(rotated.x).toBeCloseTo(0, 10);
    expect(rotated.z).toBeCloseTo(-1, 10);
  });
});
