import { describe, expect, test } from 'bun:test';
import { buildGateSuite, buildPermissionMatrix, GATE_CASE_COUNT, GATE_LEGACY_COUNT } from './gate-run';
import { layoutGateRun } from './gate-run-layout';

const suite = buildGateSuite();
const matrix = buildPermissionMatrix();

const SIZES = [
  { width: 288, height: 260 },
  { width: 358, height: 320 },
  { width: 640, height: 420 },
  { width: 640, height: 300 },
  { width: 900, height: 520 },
] as const;

describe('layoutGateRun', () => {
  for (const size of SIZES) {
    test(`${size.width}×${size.height}: every case dot sits inside the canvas`, () => {
      const layout = layoutGateRun(suite, matrix, size);

      expect(layout.dots).toHaveLength(GATE_CASE_COUNT * 2);
      for (let i = 0; i < GATE_CASE_COUNT; i += 1) {
        const x = layout.dots[i * 2]!;
        const y = layout.dots[i * 2 + 1]!;
        expect(x - layout.cell / 2).toBeGreaterThanOrEqual(-0.001);
        expect(x + layout.cell / 2).toBeLessThanOrEqual(size.width + 0.001);
        expect(y - layout.cell / 2).toBeGreaterThanOrEqual(-0.001);
        expect(y + layout.cell / 2).toBeLessThanOrEqual(layout.matrix.y);
      }
    });

    test(`${size.width}×${size.height}: no two cases share a cell`, () => {
      const layout = layoutGateRun(suite, matrix, size);
      let closest = Infinity;

      for (let i = 0; i < GATE_CASE_COUNT; i += 1) {
        for (let j = i + 1; j < GATE_CASE_COUNT; j += 1) {
          const dx = layout.dots[i * 2]! - layout.dots[j * 2]!;
          const dy = layout.dots[i * 2 + 1]! - layout.dots[j * 2 + 1]!;
          closest = Math.min(closest, Math.hypot(dx, dy));
        }
      }

      expect(closest).toBeGreaterThanOrEqual(layout.cell * 0.999);
    });

    test(`${size.width}×${size.height}: the permission matrix fits below the suite`, () => {
      const { matrix: box } = layoutGateRun(suite, matrix, size);

      expect(box.cell).toBeGreaterThan(0);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.cell * matrix.routes).toBeLessThanOrEqual(size.width + 0.001);
      expect(box.y + box.cell * matrix.profiles).toBeLessThanOrEqual(size.height + 0.001);
    });

    test(`${size.width}×${size.height}: the green suite of the report fits on screen`, () => {
      const layout = layoutGateRun(suite, matrix, size);

      expect(layout.legacy).toHaveLength(GATE_LEGACY_COUNT * 2);
      for (let i = 0; i < GATE_LEGACY_COUNT; i += 1) {
        expect(layout.legacy[i * 2]! - layout.legacyRadius).toBeGreaterThanOrEqual(0);
        expect(layout.legacy[i * 2]! + layout.legacyRadius).toBeLessThanOrEqual(size.width);
        expect(layout.legacy[i * 2 + 1]! + layout.legacyRadius).toBeLessThanOrEqual(size.height);
      }
    });
  }

  test('one spec is one block: its cases sit closer to each other than to the next spec', () => {
    const layout = layoutGateRun(suite, matrix, { width: 640, height: 420 });
    const first = suite.specs[0]!;
    const second = suite.specs[1]!;
    const lastOfFirst = layout.dots[(first.start + first.size - 1) * 2]!;
    const firstOfSecond = layout.dots[second.start * 2]!;

    // A half-cell gutter separates blocks in a lane; inside a block, neighbours are one cell apart.
    expect(firstOfSecond - lastOfFirst).toBeGreaterThan(layout.cell * 1.25);
  });

  test('a wider canvas draws larger cells', () => {
    const narrow = layoutGateRun(suite, matrix, { width: 320, height: 420 });
    const wide = layoutGateRun(suite, matrix, { width: 900, height: 420 });

    expect(wide.cell).toBeGreaterThan(narrow.cell);
  });

  test('an empty canvas lays out nothing and does not throw', () => {
    const layout = layoutGateRun(suite, matrix, { width: 0, height: 0 });

    expect(layout.cell).toBe(0);
  });
});
