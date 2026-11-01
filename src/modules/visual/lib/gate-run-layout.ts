import type { GateSuite, PermissionMatrix } from './gate-run';

/**
 * Where everything in the gate-run picture sits, in CSS pixels, for a canvas
 * of a given size. The suite is a grid of spec blocks packed into lanes; the
 * permission matrix sits under it. Cell size is the largest that fits both, so
 * a phone and a wide column draw the same picture at different scales.
 */

/** Rows in a spec block; a spec fills its block column by column. */
const ROWS_PER_SPEC = 4;
/** Gutter between spec blocks in a lane, and between lanes, in cells. */
const SPEC_GUTTER = 0.5;
const LANE_GUTTER = 0.6;
/** Height of a mono label line drawn above the suite and the matrix. */
const GATE_LABEL_HEIGHT = 18;
const SECTION_GAP = 14;
const MAX_CELL = 16;
const MIN_CELL = 1;
const CELL_STEP = 0.25;
const MAX_MATRIX_CELL = 14;
/** The matrix never takes more of the height than this; the suite is the main subject. */
const MATRIX_HEIGHT_SHARE = 0.36;
const LEGACY_COLUMNS = 6;
const LEGACY_FILL = 0.3;
const MAX_LEGACY_RADIUS = 14;

export type GateBox = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type GatePoint = { readonly x: number; readonly y: number };

export type GateLayout = {
  /** Pitch of the suite grid. 0 when there is nothing to draw into. */
  readonly cell: number;
  /** Case centres, interleaved x, y, in run order. */
  readonly dots: Float32Array;
  readonly specBoxes: readonly GateBox[];
  readonly suiteLabel: GatePoint;
  readonly matrixLabel: GatePoint;
  readonly matrix: { readonly x: number; readonly y: number; readonly cell: number };
  /** Centres of the report's green dots, interleaved x, y. */
  readonly legacy: Float32Array;
  readonly legacyRadius: number;
};

type BlockPlacement = { readonly x: number; readonly lane: number; readonly columns: number };
type Packing = { readonly blocks: readonly BlockPlacement[]; readonly lanes: number; readonly width: number };

/** Greedy lane packing in cell units. Null when a block is wider than a lane. */
function pack(suite: GateSuite, laneWidth: number): Packing | null {
  const blocks: BlockPlacement[] = [];
  let x = 0;
  let lane = 0;
  let widest = 0;

  for (const spec of suite.specs) {
    const columns = Math.ceil(spec.size / ROWS_PER_SPEC);
    if (columns > laneWidth) return null;
    if (x > 0 && x + columns > laneWidth) {
      lane += 1;
      x = 0;
    }
    blocks.push({ x, lane, columns });
    widest = Math.max(widest, x + columns);
    x += columns + SPEC_GUTTER;
  }

  return { blocks, lanes: lane + 1, width: widest };
}

function laneRows(lanes: number): number {
  return lanes * ROWS_PER_SPEC + (lanes - 1) * LANE_GUTTER;
}

function emptyLayout(suite: GateSuite): GateLayout {
  return {
    cell: 0,
    dots: new Float32Array(suite.cases.length * 2),
    specBoxes: [],
    suiteLabel: { x: 0, y: 0 },
    matrixLabel: { x: 0, y: 0 },
    matrix: { x: 0, y: 0, cell: 0 },
    legacy: new Float32Array(suite.legacyCount * 2),
    legacyRadius: 0,
  };
}

export function layoutGateRun(
  suite: GateSuite,
  matrix: PermissionMatrix,
  size: { readonly width: number; readonly height: number },
): GateLayout {
  const { width, height } = size;
  const available = height - 2 * GATE_LABEL_HEIGHT - SECTION_GAP;
  if (width <= 0 || available <= 0) return emptyLayout(suite);

  const matrixCell = Math.min(
    width / matrix.routes,
    MAX_MATRIX_CELL,
    (available * MATRIX_HEIGHT_SHARE) / matrix.profiles,
  );
  const suiteHeight = available - matrixCell * matrix.profiles;

  let cell = 0;
  let packing: Packing | null = null;
  for (let candidate = MAX_CELL; candidate >= MIN_CELL; candidate -= CELL_STEP) {
    const attempt = pack(suite, width / candidate);
    if (attempt && laneRows(attempt.lanes) * candidate <= suiteHeight) {
      cell = candidate;
      packing = attempt;
      break;
    }
  }
  if (!packing) return emptyLayout(suite);

  const suiteDrawnHeight = laneRows(packing.lanes) * cell;
  const contentHeight = 2 * GATE_LABEL_HEIGHT + SECTION_GAP + suiteDrawnHeight + matrixCell * matrix.profiles;
  const top = Math.max(0, (height - contentHeight) / 2);
  const suiteX = (width - packing.width * cell) / 2;
  const suiteY = top + GATE_LABEL_HEIGHT;

  const dots = new Float32Array(suite.cases.length * 2);
  const specBoxes: GateBox[] = [];
  suite.specs.forEach((spec, index) => {
    const block = packing.blocks[index];
    if (!block) return;
    const blockX = suiteX + block.x * cell;
    const blockY = suiteY + block.lane * (ROWS_PER_SPEC + LANE_GUTTER) * cell;
    specBoxes.push({ x: blockX, y: blockY, w: block.columns * cell, h: ROWS_PER_SPEC * cell });

    for (let offset = 0; offset < spec.size; offset += 1) {
      const at = (spec.start + offset) * 2;
      dots[at] = blockX + (Math.floor(offset / ROWS_PER_SPEC) + 0.5) * cell;
      dots[at + 1] = blockY + ((offset % ROWS_PER_SPEC) + 0.5) * cell;
    }
  });

  const matrixWidth = matrixCell * matrix.routes;
  const matrixX = (width - matrixWidth) / 2;
  const matrixY = suiteY + suiteDrawnHeight + SECTION_GAP + GATE_LABEL_HEIGHT;

  // The report's suite: a few large dots in the middle of where the real one will be.
  const legacyRows = Math.ceil(suite.legacyCount / LEGACY_COLUMNS);
  const legacyPitch = Math.min(
    width / LEGACY_COLUMNS,
    suiteDrawnHeight / legacyRows,
    (MAX_LEGACY_RADIUS / LEGACY_FILL) * 2,
  );
  const legacyRadius = Math.min(legacyPitch * LEGACY_FILL, MAX_LEGACY_RADIUS);
  const legacyX = (width - legacyPitch * LEGACY_COLUMNS) / 2;
  const legacyY = suiteY + (suiteDrawnHeight - legacyPitch * legacyRows) / 2;
  const legacy = new Float32Array(suite.legacyCount * 2);
  for (let i = 0; i < suite.legacyCount; i += 1) {
    legacy[i * 2] = legacyX + ((i % LEGACY_COLUMNS) + 0.5) * legacyPitch;
    legacy[i * 2 + 1] = legacyY + (Math.floor(i / LEGACY_COLUMNS) + 0.5) * legacyPitch;
  }

  return {
    cell,
    dots,
    specBoxes,
    suiteLabel: { x: Math.min(suiteX, matrixX), y: top },
    matrixLabel: { x: Math.min(suiteX, matrixX), y: matrixY - GATE_LABEL_HEIGHT },
    matrix: { x: matrixX, y: matrixY, cell: matrixCell },
    legacy,
    legacyRadius,
  };
}
