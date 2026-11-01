import { describe, expect, test } from 'bun:test';
import { groupThousands } from '@/common/lib/group-thousands';
import { beatAt } from '@/common/lib/scene-progress';
import { buildGateSuite, buildPermissionMatrix, GATE_CASE_COUNT, GATE_DEBT_NAMES, GATE_LEGACY_COUNT } from './gate-run';
import {
  caseStatusAt,
  decisionStatusAt,
  formatGateCounter,
  GATE_BEAT,
  GATE_RUN_BEATS,
  gateRunStateAt,
} from './gate-run-timeline';

const suite = buildGateSuite();
const matrix = buildPermissionMatrix();
const DECISIONS = matrix.profiles * matrix.routes;

describe('GATE_BEAT', () => {
  test('names every beat, in order', () => {
    expect(Object.values<number>(GATE_BEAT)).toEqual(GATE_RUN_BEATS.map((_, index) => index));
  });
});

describe('gateRunStateAt', () => {
  test("the report's dots start for the grid the moment the gate's beat begins", () => {
    const start = GATE_RUN_BEATS[GATE_BEAT.run];

    expect(gateRunStateAt(suite, matrix, start).legacyMorph).toBe(0);
    expect(gateRunStateAt(suite, matrix, start + 0.01).legacyMorph).toBeGreaterThan(0);
  });

  test('the debt is named from its own beat', () => {
    const start = GATE_RUN_BEATS[GATE_BEAT.debt];

    expect(gateRunStateAt(suite, matrix, start).debtReveal).toBe(0);
    expect(gateRunStateAt(suite, matrix, start + 0.01).debtReveal).toBeGreaterThan(0);
  });

  test('the stamp lands from the certified beat, not before', () => {
    const start = GATE_RUN_BEATS[GATE_BEAT.certified];

    expect(gateRunStateAt(suite, matrix, start - 0.01).stamp).toBe(0);
    expect(gateRunStateAt(suite, matrix, start + 0.01).stamp).toBeGreaterThan(0);
  });

  test('opens on the report: nothing of the real gate has run', () => {
    const state = gateRunStateAt(suite, matrix, 0);

    expect(state.beat).toBe(0);
    expect(state.casesRun).toBe(0);
    expect(state.decisionsResolved).toBe(0);
    expect(state.stamp).toBe(0);
  });

  test('ends certified: every case run, every debt named, every decision made', () => {
    const state = gateRunStateAt(suite, matrix, 1);

    expect(state.beat).toBe(GATE_RUN_BEATS.length - 1);
    expect(state.casesRun).toBe(GATE_CASE_COUNT);
    expect(state.held).toBe(GATE_DEBT_NAMES.length);
    expect(state.passed).toBe(GATE_CASE_COUNT - GATE_DEBT_NAMES.length);
    expect(state.debtReveal).toBe(1);
    expect(state.decisionsResolved).toBe(DECISIONS);
    expect(state.stamp).toBe(1);
  });

  test('the beat is the scene beat for the same progress', () => {
    for (const progress of [0, 0.1, 0.3, 0.55, 0.7, 0.9, 1]) {
      expect(gateRunStateAt(suite, matrix, progress).beat).toBe(beatAt(progress, GATE_RUN_BEATS));
    }
  });

  test('cases only ever run forward as progress grows', () => {
    let previous = 0;
    for (let step = 0; step <= 100; step += 1) {
      const { casesRun } = gateRunStateAt(suite, matrix, step / 100);
      expect(casesRun).toBeGreaterThanOrEqual(previous);
      previous = casesRun;
    }
  });

  test('a quarantined case is never counted as a pass, part-way or at the end', () => {
    for (let step = 0; step <= 50; step += 1) {
      const state = gateRunStateAt(suite, matrix, step / 50);
      const passedSoFar = suite.cases.slice(0, state.casesRun).filter((gateCase) => gateCase.status === 'pass').length;

      expect(state.passed).toBe(passedSoFar);
      expect(state.passed + state.held).toBe(state.casesRun);
    }
  });

  test('out-of-range progress reads as the nearest end', () => {
    expect(gateRunStateAt(suite, matrix, -1)).toEqual(gateRunStateAt(suite, matrix, 0));
    expect(gateRunStateAt(suite, matrix, 2)).toEqual(gateRunStateAt(suite, matrix, 1));
  });
});

describe('caseStatusAt', () => {
  test('at the report only the small green suite shows', () => {
    const state = gateRunStateAt(suite, matrix, 0);

    expect(caseStatusAt(suite, 0, state)).toBe('legacy');
    expect(caseStatusAt(suite, GATE_LEGACY_COUNT - 1, state)).toBe('legacy');
    expect(caseStatusAt(suite, GATE_LEGACY_COUNT, state)).toBe('hidden');
  });

  test('during the run a case is pending until its turn', () => {
    const state = gateRunStateAt(suite, matrix, 0.3);
    const firstPending = state.casesRun;

    expect(caseStatusAt(suite, firstPending, state)).toBe('pending');
    expect(caseStatusAt(suite, 0, state)).toBe('pass');
  });

  test('a debt case that has run is held, then named once the debt is revealed', () => {
    const debtIndex = suite.cases.findIndex((gateCase) => gateCase.status === 'quarantined');

    expect(caseStatusAt(suite, debtIndex, gateRunStateAt(suite, matrix, GATE_RUN_BEATS[2] - 0.01))).toBe('held');
    expect(caseStatusAt(suite, debtIndex, gateRunStateAt(suite, matrix, 1))).toBe('debt');
  });
});

describe('decisionStatusAt', () => {
  test('decisions resolve route by route, top to bottom', () => {
    const state = { ...gateRunStateAt(suite, matrix, 1), decisionsResolved: matrix.profiles + 1 };

    expect(decisionStatusAt(matrix, 0, 0, state)).not.toBe('pending');
    expect(decisionStatusAt(matrix, matrix.profiles - 1, 0, state)).not.toBe('pending');
    expect(decisionStatusAt(matrix, 0, 1, state)).not.toBe('pending');
    expect(decisionStatusAt(matrix, 1, 1, state)).toBe('pending');
  });

  test('a resolved decision reads as the matrix decided it', () => {
    const state = gateRunStateAt(suite, matrix, 1);

    expect(decisionStatusAt(matrix, 0, 0, state)).toBe(matrix.decisions[0] ?? 'pending');
  });
});

describe('formatGateCounter', () => {
  test('reads the finished run with thousands separators', () => {
    const counter = formatGateCounter(gateRunStateAt(suite, matrix, 1), suite);

    expect(counter).toBe(
      `${groupThousands(GATE_CASE_COUNT - GATE_DEBT_NAMES.length)} passed · ${GATE_DEBT_NAMES.length} quarantined · ${groupThousands(GATE_CASE_COUNT)} of ${groupThousands(GATE_CASE_COUNT)} run`,
    );
  });

  test('reads the report as the small suite it was', () => {
    expect(formatGateCounter(gateRunStateAt(suite, matrix, 0), suite)).toBe(
      `${GATE_LEGACY_COUNT} passed · 0 quarantined · ${GATE_LEGACY_COUNT} of ${GATE_LEGACY_COUNT} run`,
    );
  });
});
