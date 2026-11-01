import { ScrollyStage } from '@/common/components/scrolly-stage';
import { arc, layers } from '@/content/arc';
import { brandSentence } from '@/content/facts';
import { ArcVisual } from '@/modules/about/components/arc-visual';
import { EraLayers } from '@/modules/about/components/era-layers';
import { ArcScene } from '@/modules/about/components/era-scene';
import { layersOwnedAt, newLayersAt } from '@/modules/about/lib/layers-owned';

const LAYER_IDS = layers.map((layer) => layer.id);

/** "Full-stack" without a path through it is a claim rather than a history. */
export function Arc() {
  const steps = arc.map((era, index) => (
    // Focusable so a keyboard reader can step through the story and the
    // visual follows; each era is named by its title when focus lands.
    <article
      key={era.id}
      tabIndex={0}
      aria-labelledby={`arc-era-${index}`}
      className='arc-era card reveal relative overflow-hidden p-5 sm:p-6'
    >
      <span
        aria-hidden='true'
        className='from-sky-high to-signal-cyan absolute inset-y-0 left-0 w-0.5 bg-linear-to-b'
      />
      {/* The era's own copy of its scene, for wherever the panel does not
          pin. Only one of the two is ever displayed (scrolly-about.css). */}
      <div className='arc-era-scene'>
        <ArcScene scene={era.scene} />
      </div>
      <div>
        <p className='tnum text-micro font-mono'>
          <span className='text-signal'>{era.period}</span>
          <span className='text-ink-faint'> · {era.place}</span>
        </p>
        <h3
          id={`arc-era-${index}`}
          className='text-h3 text-ink mt-2 font-semibold tracking-[-0.015em]'
        >
          {era.title}
        </h3>
        <p className='prose-page text-meta text-ink-muted mt-2.5'>{era.body}</p>
        <EraLayers
          owned={layersOwnedAt(LAYER_IDS, arc, index)}
          added={newLayersAt(LAYER_IDS, arc, index)}
        />
      </div>
    </article>
  ));

  return (
    <section aria-labelledby='arc'>
      <p className='legend'>The arc · 2015 to now</p>
      <h2
        id='arc'
        className='text-h2 text-ink mt-3 font-semibold tracking-[-0.025em]'
      >
        How the range was acquired
      </h2>
      <p className='prose-page text-body text-ink-muted mt-4'>{brandSentence}</p>
      <ScrollyStage
        label='The arc, one era at a time'
        visual={<ArcVisual eras={arc} />}
        steps={steps}
        className='arc-stage mt-8'
      />
    </section>
  );
}
