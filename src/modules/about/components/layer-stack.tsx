import type { CSSProperties } from 'react';
import { layers, type Era } from '@/content/arc';
import { layerCountSpans, layerStartEras } from '@/modules/about/lib/layers-owned';

type SpanStyle = CSSProperties & Record<'--from' | '--to', number>;
type FromStyle = CSSProperties & Record<'--from', number>;

const LAYER_IDS = layers.map((layer) => layer.id);

/**
 * Every layer of the product, filling in as the arc reaches the era she first
 * owned it. Stateless: each layer's first era is `--from`, compared in CSS with
 * the stage's `--active-step` (scrolly-about.css). Decorative; each era card
 * states its layers as text.
 */
export function LayerStack({ eras }: { eras: readonly Era[] }) {
  const starts = layerStartEras(LAYER_IDS, eras);

  return (
    <div
      aria-hidden='true'
      className='arc-layers'
    >
      <div className='arc-layers-head'>
        <p className='legend'>Layers owned</p>
        <p className='arc-layers-count tnum'>
          <span className='arc-layers-count-cell'>
            {/* One number per count, held across the eras that share it, so the
                panel moves only when the count changes. */}
            {layerCountSpans(LAYER_IDS, eras).map((span) => {
              const style: SpanStyle = { '--from': span.from, '--to': span.to };
              return (
                <span
                  key={span.from}
                  style={style}
                  className='arc-layers-count-value signal-text'
                >
                  {span.count}
                </span>
              );
            })}
          </span>
          <span className='arc-layers-count-total'>/ {layers.length}</span>
        </p>
      </div>
      <ol className='arc-layers-grid'>
        {layers.map((layer, index) => {
          const style: FromStyle = { '--from': starts[index] ?? eras.length };
          return (
            <li
              key={layer.id}
              style={style}
              className='arc-layer'
            >
              <span className='arc-layer-bar'>
                <span className='arc-layer-fill' />
              </span>
              <span className='arc-layer-label'>{layer.label}</span>
              <span className='arc-layer-new'>new</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
