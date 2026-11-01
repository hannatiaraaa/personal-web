/** Anything that adds layers as the story passes it — an era of the arc. */
type Adds<L> = { readonly adds: readonly L[] };

/**
 * The layers owned by the end of era `index`: everything added up to and
 * including it, in the order of `order` rather than the order they were added,
 * so the indicator always fills the same way.
 */
export function layersOwnedAt<L>(order: readonly L[], eras: readonly Adds<L>[], index: number): L[] {
  const added = new Set(eras.slice(0, Math.max(0, index) + 1).flatMap((era) => era.adds));
  return order.filter((layer) => added.has(layer));
}

/**
 * For each layer in `order`, the index of the first era that adds it. A layer
 * no era adds gets `eras.length` — one past the last era — so a comparison
 * against the active era never counts it as owned.
 */
export function layerStartEras<L>(order: readonly L[], eras: readonly Adds<L>[]): number[] {
  return order.map((layer) => {
    const start = eras.findIndex((era) => era.adds.includes(layer));
    return start === -1 ? eras.length : start;
  });
}

/**
 * The layers era `index` is the first to own, in the order of `order`. Empty
 * for an era that adds nothing new — which then has no status of its own to
 * state, since the count is the previous era's.
 */
export function newLayersAt<L>(order: readonly L[], eras: readonly Adds<L>[], index: number): L[] {
  const before = new Set(index > 0 ? layersOwnedAt(order, eras, index - 1) : []);
  return layersOwnedAt(order, eras, index).filter((layer) => !before.has(layer));
}

/** A count of layers owned, and the first and last era it holds for. */
export type LayerCountSpan = { readonly count: number; readonly from: number; readonly to: number };

/**
 * The owned count as runs of eras: consecutive eras with the same count share
 * one span, so an indicator built from them moves only when the count does.
 */
export function layerCountSpans<L>(order: readonly L[], eras: readonly Adds<L>[]): LayerCountSpan[] {
  const spans: LayerCountSpan[] = [];
  for (const index of eras.keys()) {
    const count = layersOwnedAt(order, eras, index).length;
    const last = spans.at(-1);
    if (last?.count === count) {
      spans[spans.length - 1] = { ...last, to: index };
    } else {
      spans.push({ count, from: index, to: index });
    }
  }
  return spans;
}
