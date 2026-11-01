import { describe, expect, test } from 'bun:test';
import { buildGateSuite, buildPermissionMatrix, GATE_CASE_COUNT, GATE_DEBT_NAMES } from './gate-run';
import { layoutGateRun } from './gate-run-layout';
import { buildGateRunStill, GATE_STILL_SIZE } from './gate-run-still';

const suite = buildGateSuite();
const matrix = buildPermissionMatrix();
const still = buildGateRunStill(suite, matrix);

function moves(path: string): number {
  return (path.match(/M/g) ?? []).length;
}

describe('buildGateRunStill', () => {
  test('draws every passing case once, and no quarantined case among them', () => {
    expect(moves(still.pass)).toBe(GATE_CASE_COUNT - GATE_DEBT_NAMES.length);
  });

  test('draws each named debt on its own', () => {
    expect(still.debt).toHaveLength(GATE_DEBT_NAMES.length);
    expect(still.debt.map((mark) => mark.label)).toEqual(GATE_DEBT_NAMES.map((_, index) => String(index + 1)));
  });

  test('draws every permission decision as an allow or a deny', () => {
    expect(moves(still.allow) + moves(still.deny)).toBe(matrix.profiles * matrix.routes);
  });

  test('is laid out exactly as the canvas lays out the same size', () => {
    const layout = layoutGateRun(suite, matrix, GATE_STILL_SIZE);

    expect(still.cell).toBe(layout.cell);
    expect(still.pass.startsWith(`M${layout.dots[0]!.toFixed(1)} ${layout.dots[1]!.toFixed(1)}`)).toBe(true);
  });
});
