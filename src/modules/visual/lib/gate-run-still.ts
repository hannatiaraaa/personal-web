import type { GateSuite, PermissionMatrix } from './gate-run';
import { layoutGateRun, type GateBox, type GatePoint } from './gate-run-layout';
import {
  debtTagBox,
  decisionSquare,
  GATE_LABEL_BASELINE,
  GATE_RUN_LABELS,
  GATE_SETTLED_DIM,
  GATE_TAG_HEIGHT,
  markSizes,
} from './gate-run-marks';

/**
 * The finished gate run as SVG path data, for the picture shown before the
 * canvas loads, without JavaScript, and to crawlers. One path per kind of mark
 * — a dot is a zero-length segment with a round cap — so a thousand cases cost
 * a few kilobytes of markup rather than a thousand elements.
 */

/** The still is drawn at the canvas's typical size and scaled by its viewBox. */
export const GATE_STILL_SIZE = { width: 640, height: 400 } as const;

/** A line of text, positioned at its baseline. */
export type GateStillLabel = GatePoint & { readonly text: string };

/** A named debt: its dot, the numbered tag beside it, and where the number sits in the tag. */
export type GateStillMark = GatePoint & {
  readonly label: string;
  readonly tag: GateBox;
  readonly tagText: GatePoint;
};

export type GateRunStill = {
  readonly cell: number;
  /** Stroke width that draws a passing case as a dot of the canvas's size. */
  readonly passStroke: number;
  /** Passing cases rest stepped back behind the named debt, as the canvas leaves them. */
  readonly passOpacity: number;
  readonly debtRadius: number;
  readonly matrixCell: number;
  readonly pass: string;
  readonly debt: readonly GateStillMark[];
  readonly allow: string;
  readonly deny: string;
  readonly specs: string;
  readonly suiteLabel: GateStillLabel;
  readonly matrixLabel: GateStillLabel;
};

const DECIMALS = 1;
/** A tag is square in the still: it has one digit to hold. */
const TAG_SIZE = GATE_TAG_HEIGHT;
/** The tag's number sits on a baseline this far above the tag's foot. */
const TAG_TEXT_DESCENT = 3;

function fixed(value: number): string {
  return value.toFixed(DECIMALS);
}

function dot(x: number, y: number): string {
  return `M${fixed(x)} ${fixed(y)}h0`;
}

export function buildGateRunStill(suite: GateSuite, matrix: PermissionMatrix): GateRunStill {
  const layout = layoutGateRun(suite, matrix, GATE_STILL_SIZE);
  const sizes = markSizes(layout.cell);

  const pass: string[] = [];
  const debt: GateStillMark[] = [];
  suite.cases.forEach((gateCase, index) => {
    const x = layout.dots[index * 2] ?? 0;
    const y = layout.dots[index * 2 + 1] ?? 0;
    if (gateCase.debt === null) pass.push(dot(x, y));
    else {
      const tag = debtTagBox({ x, y }, layout.cell, TAG_SIZE, GATE_STILL_SIZE.width);
      const tagText = { x: tag.x + tag.w / 2, y: tag.y + tag.h - TAG_TEXT_DESCENT };
      debt.push({ x, y, label: String(gateCase.debt + 1), tag, tagText });
    }
  });
  debt.sort((a, b) => Number(a.label) - Number(b.label));

  const { cell: matrixCell } = layout.matrix;
  const allow: string[] = [];
  const deny: string[] = [];
  for (let profile = 0; profile < matrix.profiles; profile += 1) {
    for (let route = 0; route < matrix.routes; route += 1) {
      const { x, y, w } = decisionSquare(layout.matrix, profile, route);
      const side = fixed(w);
      const square = `M${fixed(x)} ${fixed(y)}h${side}v${side}h-${side}z`;
      (matrix.decisions[profile * matrix.routes + route] === 'allow' ? allow : deny).push(square);
    }
  }

  const specs = layout.specBoxes
    .map((box) => `M${fixed(box.x)} ${fixed(box.y)}h${fixed(box.w)}v${fixed(box.h)}h-${fixed(box.w)}z`)
    .join('');

  return {
    cell: layout.cell,
    passStroke: sizes.pass * 2,
    passOpacity: 1 - GATE_SETTLED_DIM,
    debtRadius: sizes.debt,
    matrixCell,
    pass: pass.join(''),
    debt,
    allow: allow.join(''),
    deny: deny.join(''),
    specs,
    suiteLabel: { text: GATE_RUN_LABELS.suite, x: layout.suiteLabel.x, y: layout.suiteLabel.y + GATE_LABEL_BASELINE },
    matrixLabel: {
      text: GATE_RUN_LABELS.matrix,
      x: layout.matrixLabel.x,
      y: layout.matrixLabel.y + GATE_LABEL_BASELINE,
    },
  };
}
