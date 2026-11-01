import { describe, expect, test } from 'bun:test';
import {
  approachValue,
  INTRO_PULLBACK,
  introCameraScale,
  mapScrollToFlowField,
  parseSceneProgress,
  pullCamera,
  SCROLL_RESPONSE,
} from './flow-field-scroll';

describe('mapScrollToFlowField', () => {
  test('at rest the pool is calm: no disturbance, swell at its own amplitude, level', () => {
    expect(mapScrollToFlowField(0)).toEqual({ disturbance: 0, swellGain: 1, tilt: 0 });
  });

  test('disturbance peaks partway through the scroll', () => {
    const peak = mapScrollToFlowField(SCROLL_RESPONSE.peakAt);

    expect(peak.disturbance).toBeCloseTo(1);
    expect(peak.swellGain).toBeCloseTo(1 + SCROLL_RESPONSE.swellBoost);
  });

  test('rises, then settles again as the hero leaves', () => {
    const rising = mapScrollToFlowField(SCROLL_RESPONSE.peakAt / 2).disturbance;
    const peak = mapScrollToFlowField(SCROLL_RESPONSE.peakAt).disturbance;
    const leaving = mapScrollToFlowField(1).disturbance;

    expect(rising).toBeGreaterThan(0);
    expect(rising).toBeLessThan(peak);
    expect(leaving).toBe(0);
  });

  test('stays calm through the dead zone at the very start of a scroll', () => {
    expect(mapScrollToFlowField(SCROLL_RESPONSE.calmUntil / 2).disturbance).toBe(0);
  });

  test('tilt only grows, and never past its cap', () => {
    const samples = [0, 0.25, 0.5, 0.75, 1].map((travel) => mapScrollToFlowField(travel).tilt);

    for (let i = 1; i < samples.length; i += 1) expect(samples[i]!).toBeGreaterThanOrEqual(samples[i - 1]!);
    expect(samples.at(-1)).toBeCloseTo(SCROLL_RESPONSE.maxTilt);
  });

  test('every value stays in range for any input, including out-of-range ones', () => {
    for (const travel of [-1, 0, 0.1, 0.33, 0.5, 0.9, 1, 2, Number.NaN]) {
      const { disturbance, swellGain, tilt } = mapScrollToFlowField(travel);

      expect(disturbance).toBeGreaterThanOrEqual(0);
      expect(disturbance).toBeLessThanOrEqual(1);
      expect(swellGain).toBeGreaterThanOrEqual(1);
      expect(swellGain).toBeLessThanOrEqual(1 + SCROLL_RESPONSE.swellBoost);
      expect(tilt).toBeGreaterThanOrEqual(0);
      expect(tilt).toBeLessThanOrEqual(SCROLL_RESPONSE.maxTilt);
    }
  });
});

describe('approachValue', () => {
  test('moves a fraction of the way to the target each frame', () => {
    expect(approachValue(0, 1, 0.25)).toBeCloseTo(0.25);
  });

  test('converges on the target and never overshoots it', () => {
    let value = 0;
    for (let frame = 0; frame < 200; frame += 1) {
      value = approachValue(value, 1, SCROLL_RESPONSE.easing);
      expect(value).toBeLessThanOrEqual(1);
    }

    expect(value).toBeCloseTo(1, 3);
  });

  test('at the target, it stays there', () => {
    expect(approachValue(0.4, 0.4, 0.5)).toBe(0.4);
  });
});

describe('introCameraScale', () => {
  test('the finished scene keeps the camera where it has always been', () => {
    expect(introCameraScale(1)).toBe(1);
  });

  test('before the pull-back the camera sits closer in by the close-in share', () => {
    expect(introCameraScale(0)).toBeCloseTo(1 - INTRO_PULLBACK.closeIn);
    expect(introCameraScale(INTRO_PULLBACK.from)).toBeCloseTo(1 - INTRO_PULLBACK.closeIn);
  });

  test('pulls back steadily through its slice of the scene', () => {
    const early = introCameraScale(INTRO_PULLBACK.from + 0.05);
    const late = introCameraScale(INTRO_PULLBACK.to - 0.05);

    expect(early).toBeGreaterThan(1 - INTRO_PULLBACK.closeIn);
    expect(late).toBeGreaterThan(early);
    expect(late).toBeLessThan(1);
  });

  test('holds outside 0–1 rather than overshooting', () => {
    expect(introCameraScale(-1)).toBeCloseTo(1 - INTRO_PULLBACK.closeIn);
    expect(introCameraScale(2)).toBe(1);
  });
});

describe('pullCamera', () => {
  test('a scale of 1 leaves the camera where it is', () => {
    expect(pullCamera([0, 5, 10], [0, 0, 0], 1)).toEqual([0, 5, 10]);
  });

  test('moves along the line to the target, keeping the view direction', () => {
    expect(pullCamera([0, 6, 10], [0, -2, 0], 0.5)).toEqual([0, 2, 5]);
  });
});

describe('parseSceneProgress', () => {
  test('reads the progress a scene wrote', () => {
    expect(parseSceneProgress('0.2500')).toBe(0.25);
  });

  test('reads an absent or unreadable value as the finished scene', () => {
    expect(parseSceneProgress('')).toBe(1);
    expect(parseSceneProgress('auto')).toBe(1);
  });

  test('clamps a value outside 0–1', () => {
    expect(parseSceneProgress('1.5')).toBe(1);
    expect(parseSceneProgress('-0.5')).toBe(0);
  });
});
