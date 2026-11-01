import { describe, expect, test } from 'bun:test';
import {
  DRAFT_SYNC_STEP_COUNT,
  applyDraft,
  describeDraftSyncOutcome,
  judgeDraft,
  simulateDraftSync,
  type DraftSyncEventKind,
  type DraftSyncRecord,
} from './draft-sync';

const OPEN_V2: DraftSyncRecord = { version: 2, value: 'Inspected', isCompleted: false };
const COMPLETED_V3: DraftSyncRecord = { version: 3, value: 'Completed', isCompleted: true };

describe('judgeDraft', () => {
  test('without ownership, every draft is accepted — even one built on an old version of a completed job', () => {
    const verdict = judgeDraft(COMPLETED_V3, { baseVersion: 1, value: 'In progress' }, 'last-write-wins');

    expect(verdict).toEqual({ isAccepted: true });
  });

  test('with draft ownership, a draft arriving after its job completed is rejected', () => {
    const verdict = judgeDraft(COMPLETED_V3, { baseVersion: 3, value: 'In progress' }, 'draft-ownership');

    expect(verdict).toEqual({ isAccepted: false, reason: 'job-completed' });
  });

  test('with draft ownership, a draft built on an older version of an open job is rejected as stale', () => {
    const verdict = judgeDraft(OPEN_V2, { baseVersion: 1, value: 'In progress' }, 'draft-ownership');

    expect(verdict).toEqual({ isAccepted: false, reason: 'stale-base' });
  });

  test('with draft ownership, a draft built on the current version of an open job is accepted', () => {
    const verdict = judgeDraft(OPEN_V2, { baseVersion: 2, value: 'Parts ordered' }, 'draft-ownership');

    expect(verdict).toEqual({ isAccepted: true });
  });
});

describe('applyDraft', () => {
  test('an accepted draft becomes the next version and reopens the job', () => {
    const { record } = applyDraft(COMPLETED_V3, { baseVersion: 1, value: 'In progress' }, 'last-write-wins');

    expect(record).toEqual({ version: 4, value: 'In progress', isCompleted: false });
  });

  test('a rejected draft leaves the record exactly as it was', () => {
    const { record } = applyDraft(COMPLETED_V3, { baseVersion: 1, value: 'In progress' }, 'draft-ownership');

    expect(record).toBe(COMPLETED_V3);
  });
});

describe('simulateDraftSync', () => {
  test('tells the same six events in order under either policy', () => {
    const kinds: DraftSyncEventKind[] = ['download', 'go-offline', 'sync', 'complete', 'reconnect', 'push-draft'];

    expect(simulateDraftSync('last-write-wins').map((step) => step.kind)).toEqual(kinds);
    expect(simulateDraftSync('draft-ownership').map((step) => step.kind)).toEqual(kinds);
    expect(DRAFT_SYNC_STEP_COUNT).toBe(kinds.length);
  });

  test('the policies agree on everything before the stale draft arrives', () => {
    const without = simulateDraftSync('last-write-wins').slice(0, -1);
    const withOwnership = simulateDraftSync('draft-ownership').slice(0, -1);

    expect(withOwnership).toEqual(without);
  });

  test('both tablets start online with version 1 and no draft', () => {
    const [first] = simulateDraftSync('last-write-wins');

    expect(first?.record).toEqual({ version: 1, value: 'Open', isCompleted: false });
    expect(first?.tablets.A).toEqual({ signal: 'online', draft: null });
    expect(first?.tablets.B).toEqual({ signal: 'online', draft: null });
    expect(first?.messages).toHaveLength(2);
  });

  test('tablet A goes offline holding a draft built on version 1', () => {
    const offline = simulateDraftSync('last-write-wins')[1];

    expect(offline?.tablets.A).toEqual({ signal: 'offline', draft: { baseVersion: 1, value: 'In progress' } });
    expect(offline?.messages).toEqual([]);
  });

  test('tablet B moves the record on and completes the job while A is away', () => {
    const steps = simulateDraftSync('last-write-wins');

    expect(steps[2]?.record).toEqual(OPEN_V2);
    expect(steps[3]?.record).toEqual(COMPLETED_V3);
    expect(steps[3]?.tablets.A.signal).toBe('offline');
  });

  test('tablet A comes back still holding its version 1 draft', () => {
    const reconnect = simulateDraftSync('last-write-wins')[4];

    expect(reconnect?.tablets.A).toEqual({ signal: 'reconnecting', draft: { baseVersion: 1, value: 'In progress' } });
    expect(reconnect?.record).toEqual(COMPLETED_V3);
  });

  test('without ownership the stale draft lands and the completed record reverts', () => {
    const last = simulateDraftSync('last-write-wins').at(-1);

    expect(last?.outcome).toBe('reverted');
    expect(last?.record).toEqual({ version: 4, value: 'In progress', isCompleted: false });
    expect(last?.messages).toEqual([{ from: 'A', to: 'server', payload: 'draft · base v1', delivery: 'accepted' }]);
    expect(last?.label).toMatch(/reverted/i);
  });

  test('with draft ownership the stale draft is rejected and the record stays completed', () => {
    const last = simulateDraftSync('draft-ownership').at(-1);

    expect(last?.outcome).toBe('rejected');
    expect(last?.record).toEqual(COMPLETED_V3);
    expect(last?.messages).toEqual([{ from: 'A', to: 'server', payload: 'draft · base v1', delivery: 'rejected' }]);
    expect(last?.label).toMatch(/rejected — job already completed/i);
  });

  test('every step but the last is still pending', () => {
    const outcomes = simulateDraftSync('draft-ownership').map((step) => step.outcome);

    expect(outcomes.slice(0, -1).every((outcome) => outcome === 'pending')).toBe(true);
  });

  test('every step carries a readable label', () => {
    for (const step of simulateDraftSync('last-write-wins')) {
      expect(step.label.length).toBeGreaterThan(10);
    }
  });

  test('is deterministic', () => {
    expect(simulateDraftSync('draft-ownership')).toEqual(simulateDraftSync('draft-ownership'));
  });
});

describe('describeDraftSyncOutcome', () => {
  test('names the revert without ownership and the rejection with it', () => {
    expect(describeDraftSyncOutcome('last-write-wins')).toMatch(/reverted/i);
    expect(describeDraftSyncOutcome('draft-ownership')).toMatch(/rejected/i);
  });
});
