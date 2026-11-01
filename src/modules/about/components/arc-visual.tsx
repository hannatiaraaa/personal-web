import type { CSSProperties } from 'react';
import type { Era } from '@/content/arc';
import { ArcScene } from './era-scene';
import { LayerStack } from './layer-stack';

type EraStyle = CSSProperties & Record<'--era', number>;
type VisualStyle = CSSProperties & Record<'--era-count', number>;

function eraStyle(index: number): EraStyle {
  return { '--era': index };
}

/**
 * The panel beside the arc: a spine with a dot per era, the era's period,
 * place and scene, and the layers owned so far. Stateless: each piece carries
 * `--era`, compared in CSS with the stage's `--active-step` (scrolly-about.css).
 * Period, place and layers are hidden from assistive tech; each era card states them.
 */
export function ArcVisual({ eras }: { eras: readonly Era[] }) {
  const style: VisualStyle = { '--era-count': eras.length };

  return (
    <div
      style={style}
      className='arc-visual card'
    >
      <div
        aria-hidden='true'
        className='arc-spine'
      >
        <span className='arc-spine-track' />
        <span className='arc-spine-fill' />
        {eras.map((era, index) => (
          <span
            key={era.id}
            style={eraStyle(index)}
            className='arc-dot'
          />
        ))}
      </div>

      <div className='arc-panel'>
        <div
          aria-hidden='true'
          className='arc-panel-head'
        >
          <p className='arc-years'>
            {eras.map((era, index) => (
              <span
                key={era.id}
                style={eraStyle(index)}
                className='arc-year tnum signal-text font-semibold'
              >
                {era.period}
              </span>
            ))}
          </p>
          <p className='arc-places'>
            {eras.map((era, index) => (
              <span
                key={era.id}
                style={eraStyle(index)}
                className='arc-place text-meta text-ink-muted font-mono'
              >
                {era.place}
              </span>
            ))}
          </p>
        </div>
        <div className='arc-scenes'>
          {eras.map((era, index) => (
            <div
              key={era.id}
              data-era={index}
              style={eraStyle(index)}
              className='arc-scene'
            >
              <ArcScene scene={era.scene} />
            </div>
          ))}
        </div>
        <LayerStack eras={eras} />
      </div>
    </div>
  );
}
