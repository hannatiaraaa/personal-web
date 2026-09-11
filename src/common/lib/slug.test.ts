import { describe, expect, test } from 'bun:test';
import { slugify } from './slug';

describe('slugify', () => {
  test('never leaves whitespace, which is what made an id invalid', () => {
    expect(slugify('Reach for daily')).toBe('reach-for-daily');
    expect(slugify('  Offline-first and on-device  ')).toBe('offline-first-and-on-device');
  });

  test('collapses punctuation instead of emitting it', () => {
    expect(slugify('Architecture & release quality')).toBe('architecture-release-quality');
    expect(slugify('AI-assisted delivery')).toBe('ai-assisted-delivery');
  });

  test('is stable, so an id matches the aria-labelledby that points at it', () => {
    const title = 'Also used, less recently';
    expect(slugify(title)).toBe(slugify(title));
  });

  test('produces distinct ids for the stack group titles', () => {
    const titles = [
      'Reach for daily',
      'Offline-first and on-device',
      'Architecture and release quality',
      'Domain',
      'AI-assisted delivery',
      'Also used, less recently',
    ];

    expect(new Set(titles.map(slugify)).size).toBe(titles.length);
  });
});
