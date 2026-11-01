import { describe, expect, test } from 'bun:test';
import { layerCountSpans, layersOwnedAt, newLayersAt } from '@/modules/about/lib/layers-owned';
import { arc, layers } from './arc';

const LAYER_IDS = layers.map((layer) => layer.id);

/** The layer labels era `id` is the first to own. */
function newLabelsOf(id: string): string[] {
  const index = arc.findIndex((era) => era.id === id);
  const added = newLayersAt(LAYER_IDS, arc, index);
  return layers.filter((layer) => added.includes(layer.id)).map((layer) => layer.label);
}

function ownedCountOf(id: string): number {
  return layersOwnedAt(
    LAYER_IDS,
    arc,
    arc.findIndex((era) => era.id === id),
  ).length;
}

describe('the arc of layers owned', () => {
  test('lists seven layers in the order the story reaches them', () => {
    expect(layers.map((layer) => layer.label)).toEqual([
      'Maths & modelling',
      'Frontend & mobile',
      'Offline data',
      'API & rules',
      'ERP integration',
      'Release gate',
      'Review & practice',
    ]);
  });

  test('the mathematics era owns its own layer, so the story opens at one, not zero', () => {
    expect(ownedCountOf('mathematics')).toBe(1);
    expect(newLabelsOf('mathematics')).toEqual(['Maths & modelling']);
  });

  test('the patient-app migration adds frontend and mobile as one layer', () => {
    expect(ownedCountOf('nalagenetics-migration')).toBe(2);
    expect(newLabelsOf('nalagenetics-migration')).toEqual(['Frontend & mobile']);
  });

  test('eras that go deeper rather than wider add nothing', () => {
    expect(newLabelsOf('nalagenetics-ownership')).toEqual([]);
    expect(newLabelsOf('altonaut-joined')).toEqual([]);
    expect(newLabelsOf('altonaut-migration')).toEqual([]);
  });

  test('every layer is owned by the last era', () => {
    expect(ownedCountOf('altonaut-review')).toBe(layers.length);
  });

  test('no era states a count of zero', () => {
    expect(layerCountSpans(LAYER_IDS, arc).map((span) => span.count)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
