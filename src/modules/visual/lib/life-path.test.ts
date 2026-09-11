import { describe, expect, test } from 'bun:test';
import {
  buildLifePathGeometry,
  fisherFront,
  frontAt,
  frontEnvelope,
  frontPhase,
  frontReach,
  FRONT_PERIOD,
  HELIX_RADIUS,
  LATTICE_SIDE,
  POINT_COUNT,
  Role,
  RUNG_EVERY,
  stageAtTime,
  strandPoint,
  swellHeight,
} from './life-path';

describe('fisherFront', () => {
  test('stays within the density the harvest leaves available', () => {
    const harvest = 0.35;

    for (let r = 0; r <= 1; r += 0.05) {
      for (let reach = -0.2; reach <= 1.4; reach += 0.1) {
        const value = fisherFront(r, reach, harvest);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1 - harvest + 1e-6);
      }
    }
  });

  test('falls off monotonically with distance, which is what makes it a front', () => {
    let previous = fisherFront(0, 0.6);

    for (let r = 0.05; r <= 1; r += 0.05) {
      const value = fisherFront(r, 0.6);
      expect(value).toBeLessThanOrEqual(previous + 1e-9);
      previous = value;
    }
  });

  test('rises at a fixed point as the front reaches it', () => {
    const atRim = (reach: number) => fisherFront(0.8, reach);

    expect(atRim(1.1)).toBeGreaterThan(atRim(0.6));
    expect(atRim(0.6)).toBeGreaterThan(atRim(0.1));
  });

  test('leaves a lower plateau as the harvest rises — the thesis result', () => {
    const behindTheFront = (harvest: number) => fisherFront(0, 1.4, harvest);

    expect(behindTheFront(0)).toBeGreaterThan(behindTheFront(0.3));
    expect(behindTheFront(0.3)).toBeGreaterThan(behindTheFront(0.6));
    expect(behindTheFront(0)).toBeCloseTo(1, 3);
  });

  test('spreads nothing once the harvest reaches carrying capacity', () => {
    for (let reach = -0.2; reach <= 1.4; reach += 0.2) {
      expect(fisherFront(0, reach, 1)).toBe(0);
      expect(fisherFront(0.4, reach, 1.4)).toBe(0);
    }
  });
});

describe('the front sweep', () => {
  test('phase stays in the unit interval and wraps on the period', () => {
    for (let t = -20; t <= 40; t += 0.37) {
      const phase = frontPhase(t);
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(1);
    }

    expect(frontPhase(0)).toBeCloseTo(0, 6);
    expect(frontPhase(FRONT_PERIOD)).toBeCloseTo(0, 6);
    expect(frontPhase(FRONT_PERIOD / 2)).toBeCloseTo(0.5, 6);
  });

  test('reach starts inside the centre and finishes past the rim', () => {
    expect(frontReach(0)).toBeLessThan(0);
    expect(frontReach(1)).toBeGreaterThan(1);
  });

  test('reach advances with phase', () => {
    let previous = frontReach(0);

    for (let phase = 0.1; phase <= 1; phase += 0.1) {
      const reach = frontReach(phase);
      expect(reach).toBeGreaterThan(previous);
      previous = reach;
    }
  });

  test('the envelope closes at both ends, so the loop does not snap', () => {
    expect(frontEnvelope(0)).toBeCloseTo(0, 6);
    expect(frontEnvelope(1)).toBeCloseTo(0, 6);
    expect(frontEnvelope(0.5)).toBeCloseTo(1, 6);
  });

  test('frontAt keeps sweeping instead of settling flat', () => {
    // The defect this replaced: reach saturated, so after a few seconds the
    // whole plane sat at one height and the front was no longer visible.
    const atMidRadius = (t: number) => frontAt(0.5, t);
    const samples = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5].map(atMidRadius);
    const spread = Math.max(...samples) - Math.min(...samples);

    expect(spread).toBeGreaterThan(0.2);
  });

  test('frontAt repeats exactly once per period', () => {
    for (const t of [0.4, 2.2, 5.9]) {
      expect(frontAt(0.4, t)).toBeCloseTo(frontAt(0.4, t + FRONT_PERIOD), 6);
    }
  });

  test('frontAt never exceeds the harvested plateau', () => {
    for (let t = 0; t < FRONT_PERIOD * 2; t += 0.1) {
      for (let r = 0; r <= 1; r += 0.1) {
        expect(frontAt(r, t, 0.35)).toBeLessThanOrEqual(0.65 + 1e-6);
        expect(frontAt(r, t, 0.35)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('swellHeight', () => {
  test('stays inside the sum of its component amplitudes', () => {
    for (let x = -5; x <= 5; x += 0.5) {
      for (let z = -5; z <= 5; z += 0.5) {
        const value = swellHeight(x, z, 3.4);
        expect(Math.abs(value)).toBeLessThanOrEqual(0.62 + 0.34 + 0.22 + 1e-6);
      }
    }
  });

  test('is not a single sine, so it reads as water rather than corrugation', () => {
    // A lone sinusoid repeats exactly one wavelength along its heading. Three
    // components at different headings do not.
    const wavelength = (2 * Math.PI) / 0.75;

    expect(swellHeight(0, 0, 0)).not.toBeCloseTo(swellHeight(wavelength, 0, 0), 3);
  });

  test('moves with time', () => {
    expect(swellHeight(1.2, -0.7, 0)).not.toBeCloseTo(swellHeight(1.2, -0.7, 1.5), 4);
  });
});

describe('buildLifePathGeometry', () => {
  const geometry = buildLifePathGeometry();

  test('fills one xyz triple per point for both shapes', () => {
    expect(geometry.count).toBe(POINT_COUNT);
    expect(geometry.plane.length).toBe(POINT_COUNT * 3);
    expect(geometry.helix.length).toBe(POINT_COUNT * 3);
    expect(geometry.radius.length).toBe(POINT_COUNT);
    expect(geometry.role.length).toBe(POINT_COUNT);
  });

  test('emits only finite coordinates', () => {
    for (const value of geometry.plane) expect(Number.isFinite(value)).toBe(true);
    for (const value of geometry.helix) expect(Number.isFinite(value)).toBe(true);
  });

  test('lays the plane flat and centres it on the origin', () => {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < geometry.count; i += 1) {
      expect(geometry.plane[i * 3 + 1]).toBe(0);
      const x = geometry.plane[i * 3]!;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }

    expect(minX).toBeCloseTo(-maxX, 6);
  });

  test('normalises radius to reach both ends of the unit interval', () => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const value of geometry.radius) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      if (value < min) min = value;
      if (value > max) max = value;
    }

    expect(min).toBeCloseTo(0, 1);
    expect(max).toBeCloseTo(1, 6);
  });

  test('assigns every point a known helix role, and uses all three', () => {
    const known: readonly number[] = [Role.StrandA, Role.StrandB, Role.BasePair];
    const seen = new Set<number>();

    for (const value of geometry.role) {
      expect(known).toContain(value);
      seen.add(value);
    }

    expect(seen.size).toBe(3);
  });

  test('holds both strands near the helix radius, with thickness', () => {
    for (let i = 0; i < geometry.count; i += 1) {
      if (geometry.role[i] === Role.BasePair) continue;

      const x = geometry.helix[i * 3]!;
      const z = geometry.helix[i * 3 + 2]!;
      // Spread across the band, but never collapsed onto the axis or flung out.
      expect(Math.hypot(x, z)).toBeGreaterThan(HELIX_RADIUS - 0.2);
      expect(Math.hypot(x, z)).toBeLessThan(HELIX_RADIUS + 0.2);
    }
  });

  test('gives every strand point in a row a distinct position', () => {
    // The defect this replaced: a strand position depended only on the row, so
    // an entire row of strand points occupied one coordinate.
    const side = LATTICE_SIDE;
    const row = Math.floor(side / 3);
    const seen = new Set<string>();
    let strandPoints = 0;

    for (let column = 0; column < side; column += 1) {
      const index = row * side + column;
      if (geometry.role[index] === Role.BasePair) continue;

      strandPoints += 1;
      const x = geometry.helix[index * 3]!.toFixed(5);
      const z = geometry.helix[index * 3 + 2]!.toFixed(5);
      seen.add(`${x},${z}`);
    }

    expect(strandPoints).toBeGreaterThan(50);
    expect(seen.size).toBe(strandPoints);
  });
});

describe('strandPoint', () => {
  test('puts the two strands in phase opposition at the same band position', () => {
    for (const v of [0.1, 0.37, 0.62, 0.95]) {
      const [ax, ay, az] = strandPoint(v, 0.5, 0);
      const [bx, by, bz] = strandPoint(v, 0.5, 1);

      // Half a turn apart, so the xz components cancel.
      expect(ax + bx).toBeCloseTo(0, 10);
      expect(az + bz).toBeCloseTo(0, 10);
      expect(ay).toBeCloseTo(by, 10);
    }
  });

  test('sits on the helix radius at the centre of the band', () => {
    const [x, , z] = strandPoint(0.4, 0.5, 0);

    expect(Math.hypot(x, z)).toBeCloseTo(HELIX_RADIUS, 10);
  });

  test('spreads across the band, so a strand has thickness', () => {
    const inner = strandPoint(0.4, 0, 0);
    const outer = strandPoint(0.4, 1, 0);

    expect(Math.hypot(inner[0], inner[2])).toBeLessThan(Math.hypot(outer[0], outer[2]));
  });

  test('climbs the axis with v', () => {
    expect(strandPoint(0.2, 0.5, 0)[1]).toBeLessThan(strandPoint(0.8, 0.5, 0)[1]);
  });
});

describe('buildLifePathGeometry, continued', () => {
  const geometry = buildLifePathGeometry();

  test('draws base pairs on every sixth row only, so the rungs stay discrete', () => {
    const side = LATTICE_SIDE;

    for (let row = 0; row < side; row += 1) {
      const middle = row * side + Math.floor(side / 2);
      const expected = row % RUNG_EVERY === 0;

      expect(geometry.role[middle] === Role.BasePair).toBe(expected);
    }
  });

  test('keeps base pairs on the rung between the strands', () => {
    for (let i = 0; i < geometry.count; i += 1) {
      if (geometry.role[i] !== Role.BasePair) continue;

      const x = geometry.helix[i * 3]!;
      const z = geometry.helix[i * 3 + 2]!;
      // Never outside the strands.
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(HELIX_RADIUS + 1e-5);
    }
  });

  test('survives a one-point lattice without dividing by zero', () => {
    const single = buildLifePathGeometry(1);

    expect(single.count).toBe(1);
    for (const value of single.helix) expect(Number.isFinite(value)).toBe(true);
    for (const value of single.plane) expect(Number.isFinite(value)).toBe(true);
  });

  test('is reproducible, so the hero is the same shape on every load', () => {
    const again = buildLifePathGeometry();

    expect(Array.from(again.helix)).toEqual(Array.from(geometry.helix));
  });
});

describe('stageAtTime', () => {
  const HOLD = 4.2;
  const TRANSITION = 2.1;

  test('rests on a whole stage during the hold', () => {
    expect(stageAtTime(0)).toBeCloseTo(0, 6);
    expect(stageAtTime(HOLD * 0.5)).toBeCloseTo(0, 6);
    expect(stageAtTime(HOLD)).toBeCloseTo(0, 6);
  });

  test('moves between stages during the transition', () => {
    const midway = stageAtTime(HOLD + TRANSITION / 2);

    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1);
  });

  test('arrives on each stage in turn', () => {
    const step = HOLD + TRANSITION;

    expect(stageAtTime(step)).toBeCloseTo(1, 6);
    expect(stageAtTime(step * 2)).toBeCloseTo(2, 6);
  });

  test('wraps back to the first stage', () => {
    const cycle = (HOLD + TRANSITION) * 3;

    expect(stageAtTime(cycle)).toBeCloseTo(0, 6);
    expect(stageAtTime(cycle * 4)).toBeCloseTo(0, 6);
  });

  test('never leaves the range the shader mixes over', () => {
    for (let t = 0; t < 200; t += 0.13) {
      const stage = stageAtTime(t);
      expect(stage).toBeGreaterThanOrEqual(0);
      expect(stage).toBeLessThan(3);
    }
  });
});
