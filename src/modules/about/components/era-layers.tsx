import { layers, type Layer } from '@/content/arc';

type Props = {
  /** Every layer owned by the end of this era. */
  owned: readonly Layer[];
  /** The ones this era is where she first owned; empty when it adds none. */
  added: readonly Layer[];
};

/**
 * One era's place on the spine, inside its card: how many layers were owned by
 * then, which one was new, and — wherever the pinned panel is not shown — the
 * same fill as a strip of segments. An era that adds no layer states no count
 * on screen, which would only repeat the era before; a screen reader, which
 * meets one card at a time, still hears where it stands.
 */
export function EraLayers({ owned, added }: Props) {
  const addedLabels = layers.filter((layer) => added.includes(layer.id)).map((layer) => layer.label);

  return (
    <div className='arc-era-layers'>
      <ol
        aria-hidden='true'
        className='arc-era-layer-strip'
      >
        {layers.map((layer) => (
          <li
            key={layer.id}
            data-owned={owned.includes(layer.id) || undefined}
            data-new={added.includes(layer.id) || undefined}
            className='arc-era-layer'
          />
        ))}
      </ol>
      {addedLabels.length > 0 ? (
        <p className='arc-era-layer-status tnum text-micro text-ink-muted font-mono'>
          {owned.length} of {layers.length} layers owned
          {' · '}
          <span className='text-signal font-semibold'>new: {addedLabels.join(', ')}</span>
        </p>
      ) : (
        <p className='sr-only'>
          {owned.length} of {layers.length} layers owned, no new layer
        </p>
      )}
    </div>
  );
}
