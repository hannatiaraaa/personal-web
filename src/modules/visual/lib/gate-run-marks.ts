import { easeProgress } from '@/common/lib/scroll-progress';
import type { GateSuite, PermissionMatrix } from './gate-run';
import type { GateBox, GateLayout, GatePoint } from './gate-run-layout';
import { caseStatusAt, GATE_BEAT, type GateRunState } from './gate-run-timeline';

/**
 * What each mark of the gate-run picture is, and where and how strongly it is
 * drawn, for a layout and a state. The canvas painter and the server-rendered
 * still both draw from here, so the two pictures cannot drift apart; neither
 * does any arithmetic of its own.
 */

/** Each mark's size as a share of the grid cell it sits in. */
const MARK_SHARE = {
  pending: 0.17,
  pass: 0.36,
  held: 0.3,
  debt: 0.46,
  /** A named debt's halo reaches past its neighbours, so it reads at any scale. */
  halo: 1.5,
  /** Cases just run glow, so the eye follows the run through the grid. */
  head: 0.9,
  heldStroke: 0.12,
  /** A spec's outline stands this far proud of its block. */
  specPad: 0.1,
  /** Inset of a decision square inside its matrix cell. */
  decisionInset: 0.18,
  pendingDecision: 0.08,
  /** How far a debt tag sits from its dot, up and to the right. */
  tagOffset: 0.7,
} as const;

/** How many of the most recently run cases glow. */
const RUN_HEAD = 28;
const MIN_HELD_STROKE = 1;
/** The report's dots fill in from this outline strength to full as they settle into the grid. */
const SPEC_ALPHA_AT_REPORT = 0.35;
const HALO_ALPHA = 0.22;
/** The sweep highlight overhangs the matrix by this much, top and bottom. */
const SWEEP_OVERHANG = 3;

/** The tick in a green dot, as shares of its radius: so "green" is not said by colour alone. */
const TICK = [
  { x: -0.42, y: 0.02 },
  { x: -0.1, y: 0.34 },
  { x: 0.46, y: -0.3 },
] as const;
const TICK_WIDTH_SHARE = 0.22;
const MIN_TICK_WIDTH = 1.5;

/** How far passing cases step back while the debt is being named, and after. */
export const GATE_DEBT_FOCUS_DIM = 0.6;
export const GATE_SETTLED_DIM = 0.3;

export const GATE_ALPHA = { pending: 0.5, head: 0.22, sweep: 0.3 } as const;

/** Type sizes in CSS pixels, so the labels read the same at every canvas size. */
export const GATE_LABEL_FONT_PX = 10;
export const GATE_TAG_FONT_PX = 9;
export const GATE_TAG_HEIGHT = 13;
/** Fully rounded: a tag is a pill. */
export const GATE_TAG_RADIUS = GATE_TAG_HEIGHT / 2;
export const GATE_TAG_PAD = 4;
/** Mono digits on a middle baseline sit a hair high; this sets them optically centred. */
const TAG_TEXT_NUDGE = 0.5;
/** Where a label's top sits below the top of its line. */
export const GATE_LABEL_TOP = 2;
/** Where a label's baseline sits below the top of its line, for a renderer that sets text on its baseline. */
export const GATE_LABEL_BASELINE = 12;

/** The labels above the suite and the matrix, set in capitals in both pictures. */
export const GATE_RUN_LABELS = {
  report: 'THE SUITE THAT SAID GREEN',
  suite: 'SUITE · SPEC BY SPEC · ILLUSTRATIVE',
  matrix: 'PERMISSION MATRIX · PROFILES × ROUTES',
} as const;

export type GateMarkSizes = {
  readonly pending: number;
  readonly pass: number;
  readonly held: number;
  readonly debt: number;
  readonly halo: number;
  readonly head: number;
  readonly heldStroke: number;
  readonly specPad: number;
  readonly decisionInset: number;
  readonly pendingDecision: number;
  readonly tagOffset: number;
};

export type CaseMarkKind = 'pending' | 'pass' | 'held' | 'debt';

export type CaseMark = {
  readonly kind: CaseMarkKind;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  /** The halo around a named debt; 0 for every other mark. */
  readonly halo: number;
};

export type GateDot = GatePoint & { readonly radius: number };

function interpolate(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function pointAt(points: Float32Array, index: number, fallback: GatePoint): GatePoint {
  return { x: points[index * 2] ?? fallback.x, y: points[index * 2 + 1] ?? fallback.y };
}

/** Every mark's size for a grid of `cell` pixels. */
export function markSizes(cell: number): GateMarkSizes {
  return {
    pending: cell * MARK_SHARE.pending,
    pass: cell * MARK_SHARE.pass,
    held: cell * MARK_SHARE.held,
    debt: cell * MARK_SHARE.debt,
    halo: cell * MARK_SHARE.halo,
    head: cell * MARK_SHARE.head,
    heldStroke: Math.max(MIN_HELD_STROKE, cell * MARK_SHARE.heldStroke),
    specPad: cell * MARK_SHARE.specPad,
    decisionInset: cell * MARK_SHARE.decisionInset,
    pendingDecision: cell * MARK_SHARE.pendingDecision,
    tagOffset: cell * MARK_SHARE.tagOffset,
  };
}

/** The report-to-grid morph, eased: the dots set off quickly and settle. */
export function legacyMorphAt(state: GateRunState): number {
  return easeProgress(state.legacyMorph, 'ease-out');
}

/**
 * How case `index` is drawn at `state`, after the report beat; null when it is
 * not drawn. `morph` is `legacyMorphAt(state)`: while it is under 1, the
 * report's dots are still travelling from where the report drew them.
 */
export function caseMarkAt(
  layout: GateLayout,
  suite: GateSuite,
  state: GateRunState,
  index: number,
  morph: number,
): CaseMark | null {
  const sizes = markSizes(layout.cell);
  const dot = pointAt(layout.dots, index, { x: 0, y: 0 });
  const status = caseStatusAt(suite, index, state);

  if (index < suite.legacyCount && morph < 1) {
    const from = pointAt(layout.legacy, index, dot);
    return {
      kind: status === 'pass' ? 'pass' : 'pending',
      x: interpolate(from.x, dot.x, morph),
      y: interpolate(from.y, dot.y, morph),
      radius: interpolate(layout.legacyRadius, sizes.pending, morph),
      halo: 0,
    };
  }

  switch (status) {
    case 'hidden':
      return null;
    case 'legacy':
    case 'pending':
      return { kind: 'pending', ...dot, radius: sizes.pending, halo: 0 };
    case 'pass':
      return { kind: 'pass', ...dot, radius: sizes.pass, halo: 0 };
    case 'held':
      return { kind: 'held', ...dot, radius: sizes.held, halo: 0 };
    case 'debt':
      return { kind: 'debt', ...dot, radius: sizes.debt, halo: sizes.halo };
  }
}

/** Whether case `index` is among the last few run, while the run is under way. */
export function isRunHead(suite: GateSuite, state: GateRunState, index: number): boolean {
  const isRunning = state.casesRun > 0 && state.casesRun < suite.cases.length;
  return isRunning && index < state.casesRun && index >= state.casesRun - RUN_HEAD;
}

/** How far the passing cases are stepped back, 0–1, so the named debt stands out. */
export function passDimAt(state: GateRunState): number {
  if (state.beat === GATE_BEAT.debt) return GATE_DEBT_FOCUS_DIM * state.debtReveal;
  return state.beat > GATE_BEAT.debt ? GATE_SETTLED_DIM : 0;
}

export function debtHaloAlpha(state: GateRunState): number {
  return HALO_ALPHA * state.debtReveal;
}

/** The spec outlines' strength for an eased morph: faint behind the report, whole once the grid has formed. */
export function specAlphaAt(morph: number): number {
  return interpolate(SPEC_ALPHA_AT_REPORT, 1, morph);
}

export function specOutline(box: GateBox, cell: number): GateBox {
  const pad = markSizes(cell).specPad;
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
}

/** The tick drawn in one of the report's green dots. */
export function legacyTick(center: GatePoint, radius: number): readonly GatePoint[] {
  return TICK.map((point) => ({ x: center.x + radius * point.x, y: center.y + radius * point.y }));
}

export function legacyTickWidth(radius: number): number {
  return Math.max(MIN_TICK_WIDTH, radius * TICK_WIDTH_SHARE);
}

/** A debt's numbered tag: up and to the right of its dot, kept inside `boundsWidth` and below the top. */
export function debtTagBox(dot: GatePoint, cell: number, tagWidth: number, boundsWidth: number): GateBox {
  const offset = markSizes(cell).tagOffset;
  return {
    x: Math.min(boundsWidth - tagWidth, dot.x + offset),
    y: Math.max(0, dot.y - offset - GATE_TAG_HEIGHT),
    w: tagWidth,
    h: GATE_TAG_HEIGHT,
  };
}

/** Where a canvas sets a tag's number: padded from the left, centred on the tag's middle line. */
export function debtTagTextPoint(box: GateBox): GatePoint {
  return { x: box.x + GATE_TAG_PAD, y: box.y + box.h / 2 + TAG_TEXT_NUDGE };
}

type MatrixPlacement = GateLayout['matrix'];

/** A made decision: a square inset in its cell. */
export function decisionSquare(placement: MatrixPlacement, profile: number, route: number): GateBox {
  const inset = markSizes(placement.cell).decisionInset;
  const side = placement.cell - inset * 2;
  return {
    x: placement.x + route * placement.cell + inset,
    y: placement.y + profile * placement.cell + inset,
    w: side,
    h: side,
  };
}

/** A decision not yet made: a small dot in the middle of its cell. */
export function pendingDecisionDot(placement: MatrixPlacement, profile: number, route: number): GateDot {
  const half = placement.cell / 2;
  return {
    x: placement.x + route * placement.cell + half,
    y: placement.y + profile * placement.cell + half,
    radius: markSizes(placement.cell).pendingDecision,
  };
}

/** The column being decided right now, or null before the sweep starts and once it is done. */
export function matrixSweepBox(
  placement: MatrixPlacement,
  matrix: PermissionMatrix,
  state: GateRunState,
): GateBox | null {
  const total = matrix.profiles * matrix.routes;
  if (state.decisionsResolved <= 0 || state.decisionsResolved >= total) return null;

  const route = Math.floor(state.decisionsResolved / matrix.profiles);
  return {
    x: placement.x + route * placement.cell,
    y: placement.y - SWEEP_OVERHANG,
    w: placement.cell,
    h: placement.cell * matrix.profiles + SWEEP_OVERHANG * 2,
  };
}
