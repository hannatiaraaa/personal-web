import { describe, expect, test } from 'bun:test';
import { pickActiveStep, readingBandAt, readingBandRootMargin, type ReadingBand } from './scroll-step';

const BAND: ReadingBand = { top: 400, bottom: 550 };

describe('pickActiveStep', () => {
  test('picks the step that overlaps the reading band', () => {
    const steps = [
      { index: 0, top: -300, bottom: 100 },
      { index: 1, top: 300, bottom: 700 },
      { index: 2, top: 900, bottom: 1300 },
    ];

    expect(pickActiveStep(steps, BAND, 0)).toBe(1);
  });

  test('keeps the previous step when nothing is in the band', () => {
    const steps = [
      { index: 0, top: -300, bottom: 100 },
      { index: 1, top: 700, bottom: 1100 },
    ];

    expect(pickActiveStep(steps, BAND, 0)).toBe(0);
    expect(pickActiveStep(steps, BAND, 1)).toBe(1);
  });

  test('prefers the step covering more of the band when two overlap it', () => {
    const steps = [
      { index: 0, top: 0, bottom: 520 },
      { index: 1, top: 520, bottom: 900 },
    ];

    // 120px of the band against 30px.
    expect(pickActiveStep(steps, BAND, 0)).toBe(0);
  });

  test('resolves an even split to the later step, so scrolling down advances', () => {
    const steps = [
      { index: 0, top: 0, bottom: 475 },
      { index: 1, top: 475, bottom: 900 },
    ];

    expect(pickActiveStep(steps, BAND, 0)).toBe(1);
  });

  test('a step merely touching the band edge does not count as in it', () => {
    const steps = [{ index: 3, top: 550, bottom: 800 }];

    expect(pickActiveStep(steps, BAND, 1)).toBe(1);
  });

  test('reads the step index from the step, not its position in the list', () => {
    const steps = [
      { index: 5, top: 0, bottom: 100 },
      { index: 2, top: 380, bottom: 600 },
    ];

    expect(pickActiveStep(steps, BAND, 5)).toBe(2);
  });

  test('keeps the previous step when there are no steps at all', () => {
    expect(pickActiveStep([], BAND, 4)).toBe(4);
  });
});

describe('readingBandAt', () => {
  test('sits just above the middle of the viewport', () => {
    expect(readingBandAt(1000)).toEqual({ top: 400, bottom: 550 });
  });
});

describe('readingBandRootMargin', () => {
  test('shrinks the viewport to the same band the picker reads', () => {
    expect(readingBandRootMargin()).toBe('-40% 0px -45% 0px');
  });
});
