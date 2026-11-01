import type { GateSuite, PermissionMatrix } from '@/modules/visual/lib/gate-run';
import type { GateBox, GateLayout } from '@/modules/visual/lib/gate-run-layout';
import {
  caseMarkAt,
  debtHaloAlpha,
  debtTagBox,
  debtTagTextPoint,
  decisionSquare,
  GATE_ALPHA,
  GATE_LABEL_FONT_PX,
  GATE_LABEL_TOP,
  GATE_RUN_LABELS,
  GATE_TAG_FONT_PX,
  GATE_TAG_PAD,
  GATE_TAG_RADIUS,
  isRunHead,
  legacyMorphAt,
  legacyTick,
  legacyTickWidth,
  markSizes,
  matrixSweepBox,
  passDimAt,
  pendingDecisionDot,
  specAlphaAt,
  specOutline,
  type CaseMarkKind,
} from '@/modules/visual/lib/gate-run-marks';
import { decisionStatusAt, GATE_BEAT, type GateRunState } from '@/modules/visual/lib/gate-run-timeline';

/**
 * Paints one frame of the gate run onto a 2D context; every mark's place and
 * strength comes from `lib/gate-run-marks`. Marks are batched by colour, one
 * path each, so a frame of a thousand-plus marks is a handful of fills.
 */

export type GatePalette = {
  pass: string;
  debt: string;
  pending: string;
  held: string;
  line: string;
  head: string;
  surface: string;
  label: string;
};

export type GatePaintInput = {
  width: number;
  height: number;
  layout: GateLayout;
  suite: GateSuite;
  matrix: PermissionMatrix;
  state: GateRunState;
  palette: GatePalette;
  fontFamily: string;
};

const FULL_TURN = Math.PI * 2;
const HAIRLINE = 1;

type Context = CanvasRenderingContext2D;

function addCircle(path: Path2D | Context, x: number, y: number, radius: number) {
  path.moveTo(x + radius, y);
  path.arc(x, y, radius, 0, FULL_TURN);
}

function addRect(path: Path2D, box: GateBox) {
  path.rect(box.x, box.y, box.w, box.h);
}

function drawLabel(context: Context, text: string, x: number, y: number, input: GatePaintInput) {
  context.font = `500 ${GATE_LABEL_FONT_PX}px ${input.fontFamily}`;
  context.fillStyle = input.palette.label;
  context.textBaseline = 'top';
  context.fillText(text, x, y + GATE_LABEL_TOP);
}

function paintReport(context: Context, input: GatePaintInput) {
  const { layout, suite, palette } = input;
  const radius = layout.legacyRadius;
  drawLabel(context, GATE_RUN_LABELS.report, layout.suiteLabel.x, layout.suiteLabel.y, input);

  context.fillStyle = palette.pass;
  context.beginPath();
  for (let i = 0; i < suite.legacyCount; i += 1) {
    addCircle(context, layout.legacy[i * 2] ?? 0, layout.legacy[i * 2 + 1] ?? 0, radius);
  }
  context.fill();

  // A tick in each, so "green" is not carried by colour alone.
  context.strokeStyle = palette.surface;
  context.lineWidth = legacyTickWidth(radius);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  for (let i = 0; i < suite.legacyCount; i += 1) {
    const [start, corner, end] = legacyTick({ x: layout.legacy[i * 2] ?? 0, y: layout.legacy[i * 2 + 1] ?? 0 }, radius);
    if (!start || !corner || !end) continue;
    context.moveTo(start.x, start.y);
    context.lineTo(corner.x, corner.y);
    context.lineTo(end.x, end.y);
  }
  context.stroke();
}

function paintSuite(context: Context, input: GatePaintInput) {
  const { layout, suite, state, palette } = input;
  const morph = legacyMorphAt(state);

  drawLabel(context, GATE_RUN_LABELS.suite, layout.suiteLabel.x, layout.suiteLabel.y, input);

  context.globalAlpha = specAlphaAt(morph);
  context.strokeStyle = palette.line;
  context.lineWidth = HAIRLINE;
  const specs = new Path2D();
  for (const box of layout.specBoxes) addRect(specs, specOutline(box, layout.cell));
  context.stroke(specs);
  context.globalAlpha = 1;

  const paths: Record<CaseMarkKind, Path2D> = {
    pending: new Path2D(),
    pass: new Path2D(),
    held: new Path2D(),
    debt: new Path2D(),
  };
  const head = new Path2D();
  const debtHalo = new Path2D();
  const headRadius = markSizes(layout.cell).head;

  for (let i = 0; i < suite.cases.length; i += 1) {
    const mark = caseMarkAt(layout, suite, state, i, morph);
    if (!mark) continue;
    addCircle(paths[mark.kind], mark.x, mark.y, mark.radius);
    if (mark.halo > 0) addCircle(debtHalo, mark.x, mark.y, mark.halo);
    if (isRunHead(suite, state, i)) addCircle(head, mark.x, mark.y, headRadius);
  }

  context.fillStyle = palette.pending;
  context.globalAlpha = GATE_ALPHA.pending;
  context.fill(paths.pending);

  context.fillStyle = palette.head;
  context.globalAlpha = GATE_ALPHA.head;
  context.fill(head);

  context.fillStyle = palette.pass;
  context.globalAlpha = 1 - passDimAt(state);
  context.fill(paths.pass);

  context.globalAlpha = 1;
  context.strokeStyle = palette.held;
  context.lineWidth = markSizes(layout.cell).heldStroke;
  context.stroke(paths.held);

  if (state.debtReveal > 0) {
    context.globalAlpha = debtHaloAlpha(state);
    context.fillStyle = palette.debt;
    context.fill(debtHalo);
    context.globalAlpha = 1;
    context.fill(paths.debt);
    paintDebtTags(context, input);
  }
}

function paintDebtTags(context: Context, input: GatePaintInput) {
  const { layout, suite, state, palette, width } = input;
  context.font = `700 ${GATE_TAG_FONT_PX}px ${input.fontFamily}`;
  context.textBaseline = 'middle';
  context.globalAlpha = state.debtReveal;

  suite.cases.forEach((gateCase, i) => {
    if (gateCase.debt === null) return;
    const text = String(gateCase.debt + 1);
    const dot = { x: layout.dots[i * 2] ?? 0, y: layout.dots[i * 2 + 1] ?? 0 };
    const tag = debtTagBox(dot, layout.cell, context.measureText(text).width + GATE_TAG_PAD * 2, width);
    const at = debtTagTextPoint(tag);

    context.fillStyle = palette.debt;
    context.beginPath();
    context.roundRect(tag.x, tag.y, tag.w, tag.h, GATE_TAG_RADIUS);
    context.fill();
    context.fillStyle = palette.surface;
    context.fillText(text, at.x, at.y);
  });

  context.globalAlpha = 1;
}

function paintMatrix(context: Context, input: GatePaintInput) {
  const { layout, matrix, state, palette } = input;

  drawLabel(context, GATE_RUN_LABELS.matrix, layout.matrixLabel.x, layout.matrixLabel.y, input);

  const pending = new Path2D();
  const allow = new Path2D();
  const deny = new Path2D();
  for (let profile = 0; profile < matrix.profiles; profile += 1) {
    for (let route = 0; route < matrix.routes; route += 1) {
      const decision = decisionStatusAt(matrix, profile, route, state);
      if (decision === 'pending') {
        const dot = pendingDecisionDot(layout.matrix, profile, route);
        addCircle(pending, dot.x, dot.y, dot.radius);
      } else {
        addRect(decision === 'allow' ? allow : deny, decisionSquare(layout.matrix, profile, route));
      }
    }
  }

  context.fillStyle = palette.pending;
  context.globalAlpha = GATE_ALPHA.pending;
  context.fill(pending);
  context.globalAlpha = 1;
  context.fillStyle = palette.pass;
  context.fill(allow);
  context.strokeStyle = palette.held;
  context.lineWidth = HAIRLINE;
  context.stroke(deny);

  // The sweep: the column being decided right now.
  const sweep = matrixSweepBox(layout.matrix, matrix, state);
  if (sweep) {
    context.fillStyle = palette.head;
    context.globalAlpha = GATE_ALPHA.sweep;
    context.fillRect(sweep.x, sweep.y, sweep.w, sweep.h);
    context.globalAlpha = 1;
  }
}

export function paintGateRun(context: Context, input: GatePaintInput) {
  context.clearRect(0, 0, input.width, input.height);
  if (input.layout.cell === 0) return;

  if (input.state.beat === GATE_BEAT.report) {
    paintReport(context, input);
    return;
  }

  paintSuite(context, input);
  paintMatrix(context, input);
}
