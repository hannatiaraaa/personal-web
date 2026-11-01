import { describe, expect, test } from 'bun:test';
import { layerCountSpans, layerStartEras, layersOwnedAt, newLayersAt } from './layers-owned';

const ORDER = ['frontend', 'mobile', 'api', 'release'] as const;
type Layer = (typeof ORDER)[number];

const ERAS: readonly { adds: readonly Layer[] }[] = [
  { adds: [] },
  { adds: ['mobile', 'frontend'] },
  { adds: [] },
  { adds: ['api'] },
];

describe('layersOwnedAt', () => {
  test('owns nothing before the first era that adds a layer', () => {
    const owned = layersOwnedAt(ORDER, ERAS, 0);

    expect(owned).toEqual([]);
  });

  test('returns what has been added so far, in the order of the layer list rather than the order added', () => {
    const owned = layersOwnedAt(ORDER, ERAS, 1);

    expect(owned).toEqual(['frontend', 'mobile']);
  });

  test('keeps every earlier layer through an era that adds none', () => {
    const owned = layersOwnedAt(ORDER, ERAS, 2);

    expect(owned).toEqual(['frontend', 'mobile']);
  });

  test('accumulates across eras', () => {
    const owned = layersOwnedAt(ORDER, ERAS, 3);

    expect(owned).toEqual(['frontend', 'mobile', 'api']);
  });

  test('treats an index past the last era as the last era', () => {
    const owned = layersOwnedAt(ORDER, ERAS, 99);

    expect(owned).toEqual(['frontend', 'mobile', 'api']);
  });
});

describe('layerStartEras', () => {
  test('gives each layer the index of the first era that adds it', () => {
    const starts = layerStartEras(ORDER, ERAS);

    expect(starts.slice(0, 3)).toEqual([1, 1, 3]);
  });

  test('places a layer no era adds one past the last era, so it is never reached', () => {
    const starts = layerStartEras(ORDER, ERAS);

    expect(starts[3]).toBe(ERAS.length);
  });

  test('keeps the first era when a later one adds the same layer again', () => {
    const starts = layerStartEras(ORDER, [{ adds: ['api'] }, { adds: ['api'] }]);

    expect(starts[2]).toBe(0);
  });
});

describe('newLayersAt', () => {
  test('returns the layers first owned in this era, in the order of the layer list', () => {
    const added = newLayersAt(ORDER, ERAS, 1);

    expect(added).toEqual(['frontend', 'mobile']);
  });

  test('returns nothing for an era that adds no layer', () => {
    const added = newLayersAt(ORDER, ERAS, 2);

    expect(added).toEqual([]);
  });

  test('does not count a layer an earlier era already added', () => {
    const added = newLayersAt(ORDER, [{ adds: ['api'] }, { adds: ['api', 'release'] }], 1);

    expect(added).toEqual(['release']);
  });
});

describe('layerCountSpans', () => {
  test('gives each owned count the run of eras it holds for, so a count never repeats', () => {
    const spans = layerCountSpans(ORDER, ERAS);

    expect(spans).toEqual([
      { count: 0, from: 0, to: 0 },
      { count: 2, from: 1, to: 2 },
      { count: 3, from: 3, to: 3 },
    ]);
  });

  test('returns no spans for no eras', () => {
    const spans = layerCountSpans(ORDER, []);

    expect(spans).toEqual([]);
  });
});
