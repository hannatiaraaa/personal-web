import { describe, expect, test } from 'bun:test';
import { beatAt, formatProgress, sceneProgress, segmentProgress } from './scene-progress';

const VIEWPORT = 800;

describe('sceneProgress, pinned', () => {
  // A section three viewports tall: its sticky child holds for two viewports of scroll.
  const height = VIEWPORT * 3;

  test('is 0 while the section top is still below the viewport top', () => {
    expect(sceneProgress({ top: 300, height }, VIEWPORT, 'pinned')).toBe(0);
  });

  test('is 0 the moment the section top reaches the viewport top', () => {
    expect(sceneProgress({ top: 0, height }, VIEWPORT, 'pinned')).toBe(0);
  });

  test('is halfway when half the pinned travel has scrolled past', () => {
    expect(sceneProgress({ top: -VIEWPORT, height }, VIEWPORT, 'pinned')).toBeCloseTo(0.5);
  });

  test('is 1 when the section bottom reaches the viewport bottom, and stays 1 after', () => {
    expect(sceneProgress({ top: -(height - VIEWPORT), height }, VIEWPORT, 'pinned')).toBe(1);
    expect(sceneProgress({ top: -height, height }, VIEWPORT, 'pinned')).toBe(1);
  });

  test('a section no taller than the viewport has no travel: 0 before its top, 1 from it', () => {
    expect(sceneProgress({ top: 10, height: VIEWPORT }, VIEWPORT, 'pinned')).toBe(0);
    expect(sceneProgress({ top: 0, height: VIEWPORT }, VIEWPORT, 'pinned')).toBe(1);
    expect(sceneProgress({ top: 0, height: 200 }, VIEWPORT, 'pinned')).toBe(1);
  });
});

describe('sceneProgress, through', () => {
  const height = 400;

  test('is 0 as the element top enters at the viewport bottom', () => {
    expect(sceneProgress({ top: VIEWPORT, height }, VIEWPORT, 'through')).toBe(0);
  });

  test('is 1 as the element bottom leaves at the viewport top', () => {
    expect(sceneProgress({ top: -height, height }, VIEWPORT, 'through')).toBe(1);
  });

  test('is halfway when the element is centred', () => {
    expect(sceneProgress({ top: (VIEWPORT - height) / 2, height }, VIEWPORT, 'through')).toBeCloseTo(0.5);
  });

  test('is held to 0–1 before entry and after exit', () => {
    expect(sceneProgress({ top: VIEWPORT * 2, height }, VIEWPORT, 'through')).toBe(0);
    expect(sceneProgress({ top: -VIEWPORT * 2, height }, VIEWPORT, 'through')).toBe(1);
  });
});

describe('segmentProgress', () => {
  test('maps the sub-range onto 0–1', () => {
    expect(segmentProgress(0.2, 0.2, 0.6)).toBe(0);
    expect(segmentProgress(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
    expect(segmentProgress(0.6, 0.2, 0.6)).toBe(1);
  });

  test('holds at 0 before the range and 1 after it', () => {
    expect(segmentProgress(0.1, 0.2, 0.6)).toBe(0);
    expect(segmentProgress(0.9, 0.2, 0.6)).toBe(1);
  });

  test('an empty range is a step: 0 before its point, 1 from it', () => {
    expect(segmentProgress(0.49, 0.5, 0.5)).toBe(0);
    expect(segmentProgress(0.5, 0.5, 0.5)).toBe(1);
  });

  test('a reversed range is a step at its end, never a negative slope', () => {
    expect(segmentProgress(0.5, 0.6, 0.2)).toBe(1);
    expect(segmentProgress(0.1, 0.6, 0.2)).toBe(0);
  });
});

describe('beatAt', () => {
  const beats = [0, 0.3, 0.7] as const;

  test('is the last beat whose start has been reached', () => {
    expect(beatAt(0, beats)).toBe(0);
    expect(beatAt(0.29, beats)).toBe(0);
    expect(beatAt(0.3, beats)).toBe(1);
    expect(beatAt(0.69, beats)).toBe(1);
    expect(beatAt(1, beats)).toBe(2);
  });

  test('before the first beat starts, the scene is on its first beat', () => {
    expect(beatAt(0.1, [0.2, 0.5])).toBe(0);
  });

  test('a scene without beats is always on beat 0', () => {
    expect(beatAt(0.8, [])).toBe(0);
  });
});

describe('formatProgress', () => {
  test('writes four decimals, so a frame that moves nothing writes nothing', () => {
    expect(formatProgress(0.123456)).toBe('0.1235');
    expect(formatProgress(1)).toBe('1.0000');
  });

  test('clamps before writing', () => {
    expect(formatProgress(-2)).toBe('0.0000');
  });
});
