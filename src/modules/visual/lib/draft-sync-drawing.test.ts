import { describe, expect, test } from 'bun:test';
import { DRAFT_SYNC_STEP_COUNT } from './draft-sync';
import { draftSyncBeats, DRAFT_SYNC_LINKS, packetPath, timelineDotX } from './draft-sync-drawing';

describe('draftSyncBeats', () => {
  test("one ascending beat per step, from the scene's start", () => {
    const beats = draftSyncBeats();

    expect(beats).toHaveLength(DRAFT_SYNC_STEP_COUNT);
    expect(beats[0]).toBe(0);
    for (let i = 1; i < beats.length; i += 1) expect(beats[i]).toBeGreaterThan(beats[i - 1] ?? 1);
    expect(beats.at(-1)).toBeLessThan(1);
  });

  test('the last step starts with room left to rest on it', () => {
    expect(draftSyncBeats().at(-1)).toBeLessThanOrEqual(0.75);
  });
});

describe('timelineDotX', () => {
  test('one evenly spaced dot per step, centred in the drawing', () => {
    const xs = Array.from({ length: DRAFT_SYNC_STEP_COUNT }, (_, index) => timelineDotX(index));
    const gaps = xs.slice(1).map((x, index) => x - (xs[index] ?? 0));

    expect(new Set(gaps).size).toBe(1);
    expect(((xs[0] ?? 0) + (xs.at(-1) ?? 0)) / 2).toBe(240);
  });
});

describe('packetPath', () => {
  test('a message to a tablet runs down its link', () => {
    expect(packetPath({ from: 'server', to: 'A', payload: 'v1', delivery: 'accepted' })).toEqual({
      from: DRAFT_SYNC_LINKS.A.server,
      to: DRAFT_SYNC_LINKS.A.tablet,
    });
  });

  test('an accepted message from a tablet reaches the server', () => {
    expect(packetPath({ from: 'B', to: 'server', payload: 'v2', delivery: 'accepted' })?.to).toEqual(
      DRAFT_SYNC_LINKS.B.server,
    );
  });

  test('a rejected one stops at the guard, short of the server', () => {
    expect(packetPath({ from: 'A', to: 'server', payload: 'draft', delivery: 'rejected' })?.to).toEqual(
      DRAFT_SYNC_LINKS.A.guard,
    );
  });

  test('the server never messages itself', () => {
    expect(packetPath({ from: 'server', to: 'server', payload: '', delivery: 'accepted' })).toBeNull();
  });
});
