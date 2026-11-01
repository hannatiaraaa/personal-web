/**
 * Placement for the stack's explainer scenes: where a row of nodes sits, where
 * the steps of a loop sit, and the head on an arrow. Scene units throughout.
 */

export type ScenePoint = { readonly x: number; readonly y: number };

/** An arrowhead is this much as wide on each side as it is long. */
const ARROW_SPREAD = 0.75;
/** Coordinates are written to two places: finer is invisible in a 320-unit scene. */
const PRECISION = 100;

function round(value: number): number {
  const rounded = Math.round(value * PRECISION) / PRECISION;
  return rounded === 0 ? 0 : rounded;
}

/** `count` centres from `start` to `end`, the ends included and evenly spaced; one sits midway. */
export function spreadAlong(count: number, start: number, end: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(start + end) / 2];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + index * step);
}

/** `count` points round a circle, the first at the top and the rest clockwise. */
export function pointsOnLoop(count: number, centre: ScenePoint, radius: number): ScenePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    return { x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle) };
  });
}

/** An open chevron of length `size` with its tip on `to`, pointing the way the line from `from` runs. */
export function arrowHead(from: ScenePoint, to: ScenePoint, size: number): string {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) return '';
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  const backX = to.x - ux * size;
  const backY = to.y - uy * size;
  const spread = size * ARROW_SPREAD;
  const left = `${round(backX + uy * spread)} ${round(backY - ux * spread)}`;
  const right = `${round(backX - uy * spread)} ${round(backY + ux * spread)}`;
  return `M${left}L${round(to.x)} ${round(to.y)}L${right}`;
}

export type SceneBox = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

/** A box of `width` by `height` with its centre on `centre`. */
export function boxAround(centre: ScenePoint, width: number, height: number): SceneBox {
  return { x: centre.x - width / 2, y: centre.y - height / 2, width, height };
}

/**
 * The segment from `from` to `to`, its start pulled in by `startGap` and its end
 * by `endGap`, so an arrow between two nodes stops short of both. A segment
 * shorter than the two gaps is returned as it is.
 */
export function trimSegment(
  from: ScenePoint,
  to: ScenePoint,
  startGap: number,
  endGap: number,
): { from: ScenePoint; to: ScenePoint } {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length <= startGap + endGap) return { from, to };
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  return {
    from: { x: round(from.x + ux * startGap), y: round(from.y + uy * startGap) },
    to: { x: round(to.x - ux * endGap), y: round(to.y - uy * endGap) },
  };
}

/** Where a label naming a segment sits: midway along it, `rise` above its higher end. */
export function labelAbove(from: ScenePoint, to: ScenePoint, rise: number): ScenePoint {
  return { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - rise };
}

/** How far a line from a box's centre towards `to` runs before it leaves the box. */
export function boxExit(centre: ScenePoint, to: ScenePoint, halfWidth: number, halfHeight: number): number {
  const length = Math.hypot(to.x - centre.x, to.y - centre.y);
  if (length === 0) return 0;
  const ux = Math.abs(to.x - centre.x) / length;
  const uy = Math.abs(to.y - centre.y) / length;
  return Math.min(ux === 0 ? Infinity : halfWidth / ux, uy === 0 ? Infinity : halfHeight / uy);
}

export type SceneLink = { readonly from: ScenePoint; readonly to: ScenePoint };

type ChainOptions = {
  /** Half the size of every node's box. */
  readonly halfWidth: number;
  readonly halfHeight: number;
  /** The clear space between an arrow's end and a box. */
  readonly margin: number;
  /** A loop: the last node links back to the first. */
  readonly isClosed?: boolean;
};

/** The arrows of a flow: each node to the next, each stopping `margin` short of the boxes it joins. */
export function chainLinks(
  centres: readonly ScenePoint[],
  { halfWidth, halfHeight, margin, isClosed = false }: ChainOptions,
): SceneLink[] {
  if (centres.length < 2) return [];
  const pairs = centres.flatMap((from, index) => {
    const to = centres[index + 1] ?? (isClosed ? centres[0] : undefined);
    return to ? [{ from, to }] : [];
  });
  return pairs.map(({ from, to }) =>
    trimSegment(
      from,
      to,
      boxExit(from, to, halfWidth, halfHeight) + margin,
      boxExit(to, from, halfWidth, halfHeight) + margin,
    ),
  );
}
