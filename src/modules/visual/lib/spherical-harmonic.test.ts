import { describe, expect, test } from 'bun:test';
import {
  buildHarmonicSurface,
  DEFAULT_COEFFICIENTS,
  harmonicRadius,
  surfaceExtent,
  type HarmonicCoefficients,
} from './spherical-harmonic';

describe('harmonicRadius', () => {
  test('stays positive across the whole domain, so the surface never inverts', () => {
    for (let t = 0; t <= 32; t += 1) {
      for (let p = 0; p <= 32; p += 1) {
        const theta = (t / 32) * Math.PI;
        const phi = (p / 32) * Math.PI * 2;

        expect(harmonicRadius(theta, phi, DEFAULT_COEFFICIENTS)).toBeGreaterThan(0);
      }
    }
  });

  test('is deterministic for the same angles', () => {
    const first = harmonicRadius(1.1, 2.2, DEFAULT_COEFFICIENTS);
    const second = harmonicRadius(1.1, 2.2, DEFAULT_COEFFICIENTS);

    expect(first).toBe(second);
  });

  test('collapses to a constant when every frequency is zero', () => {
    // sin(0)^n is 0 and cos(0)^n is 1, so the sum is a sphere of radius 2 + 2.
    const flat: HarmonicCoefficients = { m: [0, 0, 0, 0], n: [2, 2, 2, 2] };

    expect(harmonicRadius(0.4, 1.9, flat)).toBeCloseTo(4, 10);
    expect(harmonicRadius(2.7, 5.1, flat)).toBeCloseTo(4, 10);
  });

  test('responds to the coefficients', () => {
    const other: HarmonicCoefficients = { m: [7, 1, 5, 2], n: [3, 2, 1, 4] };

    expect(harmonicRadius(1.0, 1.0, other)).not.toBeCloseTo(harmonicRadius(1.0, 1.0, DEFAULT_COEFFICIENTS), 6);
  });
});

describe('buildHarmonicSurface', () => {
  const COUNT = 2048;
  const surface = buildHarmonicSurface(COUNT);

  test('produces one xyz triple and one intensity per point', () => {
    expect(surface.count).toBe(COUNT);
    expect(surface.positions.length).toBe(COUNT * 3);
    expect(surface.intensities.length).toBe(COUNT);
  });

  test('emits only finite coordinates', () => {
    for (const value of surface.positions) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  test('normalises intensity into the unit interval and uses both ends', () => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const value of surface.intensities) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      if (value < min) min = value;
      if (value > max) max = value;
    }

    expect(min).toBeCloseTo(0, 6);
    expect(max).toBeCloseTo(1, 6);
  });

  test('distributes points across both hemispheres', () => {
    let above = 0;
    let below = 0;

    for (let i = 0; i < surface.count; i += 1) {
      if (surface.positions[i * 3 + 1]! > 0) above += 1;
      else below += 1;
    }

    // A pole-bunched grid would skew this badly; a Fibonacci lattice does not.
    expect(above).toBeGreaterThan(surface.count * 0.4);
    expect(below).toBeGreaterThan(surface.count * 0.4);
  });

  test('handles a single point without dividing by zero', () => {
    const single = buildHarmonicSurface(1);

    expect(single.count).toBe(1);
    for (const value of single.positions) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(Number.isFinite(single.intensities[0]!)).toBe(true);
  });

  test('is reproducible, so the shape is the same on every load', () => {
    const again = buildHarmonicSurface(COUNT);

    expect(Array.from(again.positions)).toEqual(Array.from(surface.positions));
  });
});

describe('surfaceExtent', () => {
  test('reports the largest distance from the origin', () => {
    const extent = surfaceExtent(buildHarmonicSurface(1024));

    expect(extent).toBeGreaterThan(0);
    expect(extent).toBeLessThan(8);
  });
});
