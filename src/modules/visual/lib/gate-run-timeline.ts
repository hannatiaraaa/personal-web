import { groupThousands } from '@/common/lib/group-thousands';
import { beatAt, segmentProgress } from '@/common/lib/scene-progress';
import { clampProgress } from '@/common/lib/scroll-progress';
import type { Decision, GateSuite, PermissionMatrix } from './gate-run';

/**
 * The gate run as a function of scroll progress, 0–1. Five beats: the report,
 * the real suite running, the debt named, the permission matrix swept, and the
 * release certified. Everything here is a pure read of progress, so scrolling
 * back replays it exactly and a test can assert any frame.
 */
export const GATE_RUN_BEATS = [0, 0.12, 0.5, 0.64, 0.86] as const;

/** The beats by name, as indices into `GATE_RUN_BEATS` and values of `GateRunState.beat`. */
export const GATE_BEAT = { report: 0, run: 1, debt: 2, matrix: 3, certified: 4 } as const;

type Span = { readonly start: number; readonly end: number };

/** The green dots of the report shrink into their place in the real grid, as the gate's beat opens. */
const LEGACY_MORPH: Span = { start: GATE_RUN_BEATS[GATE_BEAT.run], end: 0.18 };
const RUN: Span = { start: LEGACY_MORPH.end, end: 0.47 };
const DEBT_REVEAL: Span = { start: GATE_RUN_BEATS[GATE_BEAT.debt], end: 0.58 };
const MATRIX_SWEEP: Span = { start: 0.66, end: 0.83 };
const STAMP: Span = { start: GATE_RUN_BEATS[GATE_BEAT.certified], end: 0.92 };

export type GateRunState = {
  readonly beat: number;
  /** 0 while the report shows, 1 once its dots sit in the real grid. */
  readonly legacyMorph: number;
  /** Cases of the real gate that have run, in run order. */
  readonly casesRun: number;
  readonly passed: number;
  /** Quarantined cases that have run. Never counted as passed. */
  readonly held: number;
  readonly debtReveal: number;
  readonly decisionsResolved: number;
  readonly stamp: number;
};

export type CaseView = 'hidden' | 'legacy' | 'pending' | 'pass' | 'held' | 'debt';
export type DecisionView = Decision | 'pending';

function along(progress: number, span: Span): number {
  return segmentProgress(progress, span.start, span.end);
}

export function gateRunStateAt(suite: GateSuite, matrix: PermissionMatrix, rawProgress: number): GateRunState {
  const progress = clampProgress(rawProgress);
  const casesRun = Math.round(along(progress, RUN) * suite.cases.length);

  let held = 0;
  for (const gateCase of suite.cases) {
    if (gateCase.status === 'quarantined' && gateCase.runOrder < casesRun) held += 1;
  }

  return {
    beat: beatAt(progress, GATE_RUN_BEATS),
    legacyMorph: along(progress, LEGACY_MORPH),
    casesRun,
    passed: casesRun - held,
    held,
    debtReveal: along(progress, DEBT_REVEAL),
    decisionsResolved: Math.round(along(progress, MATRIX_SWEEP) * matrix.profiles * matrix.routes),
    stamp: along(progress, STAMP),
  };
}

/** How one case reads at a given state. */
export function caseStatusAt(suite: GateSuite, index: number, state: GateRunState): CaseView {
  if (state.beat === GATE_BEAT.report) return index < suite.legacyCount ? 'legacy' : 'hidden';

  const gateCase = suite.cases[index];
  if (!gateCase || gateCase.runOrder >= state.casesRun) return 'pending';
  if (gateCase.status === 'pass') return 'pass';
  return state.debtReveal > 0 ? 'debt' : 'held';
}

/** Decisions resolve route by route, each route's profiles top to bottom: a sweep across the matrix. */
export function decisionStatusAt(
  matrix: PermissionMatrix,
  profile: number,
  route: number,
  state: GateRunState,
): DecisionView {
  if (route * matrix.profiles + profile >= state.decisionsResolved) return 'pending';
  return matrix.decisions[profile * matrix.routes + route] ?? 'pending';
}

/** The running counter under the picture. At the report it reads the small suite that said green. */
export function formatGateCounter(state: GateRunState, suite: GateSuite): string {
  if (state.beat === GATE_BEAT.report) {
    const legacy = groupThousands(suite.legacyCount);
    return `${legacy} passed · 0 quarantined · ${legacy} of ${legacy} run`;
  }

  const total = groupThousands(suite.cases.length);
  return `${groupThousands(state.passed)} passed · ${state.held} quarantined · ${groupThousands(state.casesRun)} of ${total} run`;
}
