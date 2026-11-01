/** One dot in the release-gate teaser's grid, in its SVG's units. */
export type TeaserDot = {
  readonly x: number;
  readonly y: number;
  readonly isFlagged: boolean;
};

type DotGridSpec = {
  readonly columns: number;
  readonly rows: number;
  /** Distance between neighbouring dot centres. */
  readonly pitch: number;
  /** The grid's centre, so it sits in the middle of its viewBox. */
  readonly centerX: number;
  readonly centerY: number;
  /** Row-major index of the one dot drawn as quarantined. */
  readonly flaggedIndex: number;
};

/** Lays out a centred grid of dots, row by row, with one flagged. */
export function buildDotGrid({
  columns,
  rows,
  pitch,
  centerX,
  centerY,
  flaggedIndex,
}: DotGridSpec): readonly TeaserDot[] {
  const originX = centerX - ((columns - 1) * pitch) / 2;
  const originY = centerY - ((rows - 1) * pitch) / 2;

  return Array.from({ length: columns * rows }, (_, index) => ({
    x: originX + (index % columns) * pitch,
    y: originY + Math.floor(index / columns) * pitch,
    isFlagged: index === flaggedIndex,
  }));
}
