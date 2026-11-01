import { describe, expect, test } from 'bun:test';
import { buildGateSuite, buildPermissionMatrix } from './gate-run';
import { layoutGateRun } from './gate-run-layout';
import {
  caseMarkAt,
  debtHaloAlpha,
  debtTagBox,
  decisionSquare,
  GATE_DEBT_FOCUS_DIM,
  GATE_SETTLED_DIM,
  GATE_TAG_HEIGHT,
  isRunHead,
  legacyMorphAt,
  legacyTick,
  markSizes,
  matrixSweepBox,
  passDimAt,
  pendingDecisionDot,
  specAlphaAt,
  specOutline,
} from './gate-run-marks';
import { GATE_BEAT, GATE_RUN_BEATS, gateRunStateAt } from './gate-run-timeline';

const suite = buildGateSuite();
const matrix = buildPermissionMatrix();
const SIZE = { width: 640, height: 420 } as const;
const layout = layoutGateRun(suite, matrix, SIZE);
const FINAL = gateRunStateAt(suite, matrix, 1);
const firstDebt = suite.cases.findIndex((gateCase) => gateCase.debt !== null);
const firstPass = suite.cases.findIndex((gateCase, index) => index >= suite.legacyCount && gateCase.status === 'pass');

function dotAt(index: number) {
  return { x: layout.dots[index * 2] ?? Number.NaN, y: layout.dots[index * 2 + 1] ?? Number.NaN };
}

describe('markSizes', () => {
  test('scales every mark with the grid cell', () => {
    const small = markSizes(4);
    const large = markSizes(8);

    expect(large.pass).toBeCloseTo(small.pass * 2);
    expect(large.halo).toBeCloseTo(small.halo * 2);
    expect(large.decisionInset).toBeCloseTo(small.decisionInset * 2);
  });

  test('a named debt is drawn larger than a pass, and its halo larger still', () => {
    const sizes = markSizes(10);

    expect(sizes.debt).toBeGreaterThan(sizes.pass);
    expect(sizes.halo).toBeGreaterThan(sizes.debt);
    expect(sizes.pending).toBeLessThan(sizes.held);
  });

  test('a held ring is never thinner than a device pixel', () => {
    expect(markSizes(1).heldStroke).toBe(1);
  });
});

describe('caseMarkAt', () => {
  test('at the end, a passing case is a pass dot at its place in the grid', () => {
    const mark = caseMarkAt(layout, suite, FINAL, firstPass, legacyMorphAt(FINAL));

    expect(mark).toEqual({ kind: 'pass', ...dotAt(firstPass), radius: markSizes(layout.cell).pass, halo: 0 });
  });

  test('at the end, a quarantined case is a debt dot with its halo', () => {
    const mark = caseMarkAt(layout, suite, FINAL, firstDebt, legacyMorphAt(FINAL));

    expect(mark?.kind).toBe('debt');
    expect(mark?.halo).toBe(markSizes(layout.cell).halo);
  });

  test('a case not yet run is pending', () => {
    const state = gateRunStateAt(suite, matrix, GATE_RUN_BEATS[GATE_BEAT.run]);
    const mark = caseMarkAt(layout, suite, state, suite.cases.length - 1, 1);

    expect(mark?.kind).toBe('pending');
  });

  test("the report's dots travel from where the report drew them into the grid", () => {
    const state = gateRunStateAt(suite, matrix, GATE_RUN_BEATS[GATE_BEAT.run]);
    const start = caseMarkAt(layout, suite, state, 0, 0);
    const halfway = caseMarkAt(layout, suite, state, 0, 0.5);

    expect(start).toMatchObject({ x: layout.legacy[0], y: layout.legacy[1], radius: layout.legacyRadius });
    expect(halfway?.x).toBeCloseTo(((layout.legacy[0] ?? 0) + dotAt(0).x) / 2);
    expect(halfway?.radius).toBeCloseTo((layout.legacyRadius + markSizes(layout.cell).pending) / 2);
  });
});

describe('legacyMorphAt', () => {
  test('eases out: past halfway at the halfway point', () => {
    const state = { ...FINAL, legacyMorph: 0.5 };

    expect(legacyMorphAt(state)).toBeGreaterThan(0.5);
    expect(legacyMorphAt({ ...FINAL, legacyMorph: 0 })).toBe(0);
    expect(legacyMorphAt({ ...FINAL, legacyMorph: 1 })).toBe(1);
  });
});

describe('isRunHead', () => {
  const midRun = gateRunStateAt(suite, matrix, 0.3);

  test('the cases just run glow', () => {
    expect(isRunHead(suite, midRun, midRun.casesRun - 1)).toBe(true);
  });

  test('a case run long ago, or not yet run, does not', () => {
    expect(isRunHead(suite, midRun, 0)).toBe(false);
    expect(isRunHead(suite, midRun, midRun.casesRun)).toBe(false);
  });

  test('nothing glows once the run is complete', () => {
    expect(isRunHead(suite, FINAL, suite.cases.length - 1)).toBe(false);
  });
});

describe('passDimAt', () => {
  test('passes are at full strength until the debt is named', () => {
    expect(passDimAt(gateRunStateAt(suite, matrix, GATE_RUN_BEATS[GATE_BEAT.run]))).toBe(0);
  });

  test('they step back as the debt is revealed, and stay a little back after', () => {
    const naming = gateRunStateAt(suite, matrix, 0.54);

    expect(passDimAt(naming)).toBeCloseTo(GATE_DEBT_FOCUS_DIM * naming.debtReveal);
    expect(passDimAt(FINAL)).toBe(GATE_SETTLED_DIM);
  });
});

describe('debtHaloAlpha', () => {
  test('grows with the reveal', () => {
    expect(debtHaloAlpha({ ...FINAL, debtReveal: 0 })).toBe(0);
    expect(debtHaloAlpha({ ...FINAL, debtReveal: 1 })).toBeGreaterThan(debtHaloAlpha({ ...FINAL, debtReveal: 0.5 }));
  });
});

describe('specAlphaAt', () => {
  test('the spec outlines are faint at the report and whole once the dots are in place', () => {
    expect(specAlphaAt(0)).toBeGreaterThan(0);
    expect(specAlphaAt(0)).toBeLessThan(1);
    expect(specAlphaAt(1)).toBe(1);
  });
});

describe('specOutline', () => {
  test('stands a little proud of the spec block on every side', () => {
    const box = { x: 10, y: 20, w: 30, h: 40 };
    const outline = specOutline(box, 10);

    expect(outline.x).toBeLessThan(box.x);
    expect(outline.y).toBeLessThan(box.y);
    expect(outline.x + outline.w).toBeGreaterThan(box.x + box.w);
    expect(outline.y + outline.h).toBeGreaterThan(box.y + box.h);
  });
});

describe('legacyTick', () => {
  test('is three points inside the dot', () => {
    const points = legacyTick({ x: 50, y: 50 }, 10);

    expect(points).toHaveLength(3);
    for (const point of points) expect(Math.hypot(point.x - 50, point.y - 50)).toBeLessThan(10);
  });
});

describe('debtTagBox', () => {
  test('sits above and to the right of its dot', () => {
    const dot = { x: 100, y: 100 };
    const box = debtTagBox(dot, 10, 20, SIZE.width);

    expect(box.x).toBeGreaterThan(dot.x);
    expect(box.y + box.h).toBeLessThan(dot.y);
    expect(box.h).toBe(GATE_TAG_HEIGHT);
  });

  test('never runs past the right edge or above the top', () => {
    const box = debtTagBox({ x: SIZE.width - 1, y: 1 }, 10, 20, SIZE.width);

    expect(box.x + box.w).toBeLessThanOrEqual(SIZE.width);
    expect(box.y).toBe(0);
  });
});

describe('decisionSquare and pendingDecisionDot', () => {
  test('a decision sits inside its matrix cell, inset on every side', () => {
    const { x, y, cell } = layout.matrix;
    const square = decisionSquare(layout.matrix, 2, 3);

    expect(square.x).toBeGreaterThan(x + 3 * cell);
    expect(square.y).toBeGreaterThan(y + 2 * cell);
    expect(square.x + square.w).toBeLessThan(x + 4 * cell);
    expect(square.w).toBe(square.h);
  });

  test('a pending decision is a small dot at the centre of its cell', () => {
    const { x, y, cell } = layout.matrix;
    const dot = pendingDecisionDot(layout.matrix, 0, 0);

    expect(dot.x).toBeCloseTo(x + cell / 2);
    expect(dot.y).toBeCloseTo(y + cell / 2);
    expect(dot.radius).toBeLessThan(cell / 2);
  });
});

describe('matrixSweepBox', () => {
  test('there is no sweep before the matrix starts or once it is decided', () => {
    expect(matrixSweepBox(layout.matrix, matrix, gateRunStateAt(suite, matrix, 0.3))).toBeNull();
    expect(matrixSweepBox(layout.matrix, matrix, FINAL)).toBeNull();
  });

  test('mid-sweep it covers the whole column being decided, and a little more', () => {
    const state = gateRunStateAt(suite, matrix, 0.75);
    const box = matrixSweepBox(layout.matrix, matrix, state);
    const route = Math.floor(state.decisionsResolved / matrix.profiles);

    expect(box?.x).toBeCloseTo(layout.matrix.x + route * layout.matrix.cell);
    expect(box?.w).toBeCloseTo(layout.matrix.cell);
    expect(box?.y).toBeLessThan(layout.matrix.y);
    expect((box?.y ?? 0) + (box?.h ?? 0)).toBeGreaterThan(layout.matrix.y + matrix.profiles * layout.matrix.cell);
  });
});
