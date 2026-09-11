import { describe, expect, test } from 'bun:test';
import {
  buildVogelPool,
  FRONT_PERIOD,
  frontEnvelope,
  frontPhase,
  frontPulse,
  frontReach,
  GOLDEN_ANGLE,
  POOL_RADIUS,
  RIPPLE,
  rippleHeight,
  swellHeight,
  SWELL_AMPLITUDE,
} from './flow-field';

describe('buildVogelPool', () => {
  const pool = buildVogelPool(8000);

  test('fills one xyz triple per point, flat on the plane', () => {
    expect(pool.positions.length).toBe(8000 * 3);
    for (let i = 0; i < pool.count; i += 1) {
      expect(pool.positions[i * 3 + 1]).toBe(0);
    }
  });

  test('radii follow √n, so the last point sits exactly on the rim', () => {
    expect(pool.radius[0]).toBe(0);
    expect(pool.radius[pool.count - 1]).toBeCloseTo(1, 6);

    const midpoint = Math.floor(pool.count / 2);
    expect(pool.radius[midpoint]).toBeCloseTo(Math.sqrt(0.5), 2);
  });

  test('consecutive points are one golden angle apart', () => {
    const angleOf = (i: number) => Math.atan2(pool.positions[i * 3 + 2]!, pool.positions[i * 3]!);
    const TAU = Math.PI * 2;

    for (const i of [10, 500, 4000]) {
      const step = (angleOf(i + 1) - angleOf(i) + TAU * 2) % TAU;
      expect(step).toBeCloseTo(GOLDEN_ANGLE % TAU, 5);
    }
  });

  test('density is uniform: half the radius holds a quarter of the points', () => {
    let inner = 0;
    const half = POOL_RADIUS / 2;

    for (let i = 0; i < pool.count; i += 1) {
      const x = pool.positions[i * 3]!;
      const z = pool.positions[i * 3 + 2]!;
      if (Math.hypot(x, z) < half) inner += 1;
    }

    expect(inner / pool.count).toBeCloseTo(0.25, 2);
  });
});

describe('swellHeight', () => {
  test('stays inside the sum of its component amplitudes', () => {
    for (let x = -5; x <= 5; x += 0.5) {
      for (let z = -5; z <= 5; z += 0.5) {
        expect(Math.abs(swellHeight(x, z, 3.4))).toBeLessThanOrEqual(SWELL_AMPLITUDE + 1e-6);
      }
    }
  });

  test('moves with time and is not a single sine', () => {
    expect(swellHeight(1.2, -0.7, 0)).not.toBeCloseTo(swellHeight(1.2, -0.7, 1.5), 4);

    const wavelength = (2 * Math.PI) / 0.75;
    expect(swellHeight(0, 0, 0)).not.toBeCloseTo(swellHeight(wavelength, 0, 0), 3);
  });
});

describe('frontPulse', () => {
  test('peaks where the front is, so the ring travels with it', () => {
    // Pick a mid-cycle time and confirm the maximum sits at the reach.
    const time = FRONT_PERIOD * 0.45;
    const reach = frontReach(frontPhase(time));

    let bestRadius = 0;
    let bestValue = -1;
    for (let r = 0; r <= 1.5; r += 0.005) {
      const value = frontPulse(r, time);
      if (value > bestValue) {
        bestValue = value;
        bestRadius = r;
      }
    }

    expect(bestRadius).toBeCloseTo(reach, 1);
  });

  test('a heavier harvest dims the front, and full harvest extinguishes it — the thesis result', () => {
    const time = FRONT_PERIOD * 0.4;
    const reach = frontReach(frontPhase(time));

    expect(frontPulse(reach, time, 0.1)).toBeGreaterThan(frontPulse(reach, time, 0.6));
    expect(frontPulse(reach, time, 1)).toBe(0);
  });

  test('the envelope closes at both ends, so the loop never snaps', () => {
    expect(frontEnvelope(0)).toBeCloseTo(0, 6);
    expect(frontEnvelope(1)).toBeCloseTo(0, 6);
    expect(frontEnvelope(0.5)).toBeCloseTo(1, 6);
  });

  test('repeats exactly once per period and stays in 0..1', () => {
    for (const t of [0.7, 3.1, 6.4]) {
      expect(frontPulse(0.5, t)).toBeCloseTo(frontPulse(0.5, t + FRONT_PERIOD), 6);
    }

    for (let t = 0; t < FRONT_PERIOD; t += 0.1) {
      for (let r = 0; r <= 1; r += 0.1) {
        const value = frontPulse(r, t);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('rippleHeight', () => {
  test('is silent before the touch and after the ripple has died', () => {
    expect(rippleHeight(0.5, -0.1)).toBe(0);
    expect(rippleHeight(0.5, RIPPLE.maxAge + 0.1)).toBe(0);
  });

  test('cannot appear ahead of its own travel', () => {
    // At 0.05s the ring has moved ~0.11m; three metres out must still be flat.
    expect(rippleHeight(3, 0.05)).toBeCloseTo(0, 6);
  });

  test('stays inside its amplitude and fades with age', () => {
    for (let d = 0; d <= 4; d += 0.2) {
      for (let age = 0.05; age <= 3.4; age += 0.25) {
        expect(Math.abs(rippleHeight(d, age))).toBeLessThanOrEqual(RIPPLE.amplitude + 1e-6);
      }
    }

    // Same point, later: the envelope must have decayed.
    const early = Math.abs(rippleHeight(0.4, 0.3));
    const late = Math.abs(rippleHeight(0.4, 2.8));
    expect(late).toBeLessThan(early);
  });
});
