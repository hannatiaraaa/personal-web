/**
 * A toy model of the offline draft bug: one work order, two tablets, one away
 * for days. Six events, two policies, so the only visible difference is whether
 * a stale draft may land.
 *
 * - `last-write-wins`: whichever device reconnects last wins; nothing errors and
 *   the record reverts.
 * - `draft-ownership`: a draft arriving after its job completed, or built on a
 *   version that has moved on, is rejected.
 *
 * The values are illustrative, not product data.
 */

export type SyncPolicy = 'last-write-wins' | 'draft-ownership';

export const SYNC_POLICIES: readonly SyncPolicy[] = ['last-write-wins', 'draft-ownership'];

export type TabletId = 'A' | 'B';
export type SyncEndpoint = TabletId | 'server';
export type TabletSignal = 'online' | 'offline' | 'reconnecting';

export type DraftSyncRecord = {
  readonly version: number;
  readonly value: string;
  readonly isCompleted: boolean;
};

export type SyncDraft = { readonly baseVersion: number; readonly value: string };

export type TabletState = { readonly signal: TabletSignal; readonly draft: SyncDraft | null };

export type SyncMessage = {
  readonly from: SyncEndpoint;
  readonly to: SyncEndpoint;
  readonly payload: string;
  readonly delivery: 'accepted' | 'rejected';
};

export type DraftSyncOutcome = 'pending' | 'reverted' | 'rejected';

export type DraftSyncEventKind = 'download' | 'go-offline' | 'sync' | 'complete' | 'reconnect' | 'push-draft';

export type DraftSyncStep = {
  readonly kind: DraftSyncEventKind;
  /** What happened, in a sentence: the step's line in the event log. */
  readonly label: string;
  readonly record: DraftSyncRecord;
  readonly tablets: Readonly<Record<TabletId, TabletState>>;
  /** What travels in this step, from where to where. */
  readonly messages: readonly SyncMessage[];
  readonly outcome: DraftSyncOutcome;
};

export type DraftVerdict =
  { readonly isAccepted: true } | { readonly isAccepted: false; readonly reason: 'job-completed' | 'stale-base' };

/**
 * Whether the server takes a draft. Without ownership there is no rule that
 * could refuse it. With ownership a completed job refuses every late draft,
 * and an open one refuses a draft built on a version it has moved past.
 */
export function judgeDraft(record: DraftSyncRecord, draft: SyncDraft, policy: SyncPolicy): DraftVerdict {
  if (policy === 'last-write-wins') return { isAccepted: true };
  if (record.isCompleted) return { isAccepted: false, reason: 'job-completed' };
  if (draft.baseVersion < record.version) return { isAccepted: false, reason: 'stale-base' };
  return { isAccepted: true };
}

/** The record after a draft arrives: the next version if accepted, untouched if not. */
export function applyDraft(
  record: DraftSyncRecord,
  draft: SyncDraft,
  policy: SyncPolicy,
): { readonly record: DraftSyncRecord; readonly verdict: DraftVerdict } {
  const verdict = judgeDraft(record, draft, policy);
  if (!verdict.isAccepted) return { record, verdict };
  return { record: { version: record.version + 1, value: draft.value, isCompleted: false }, verdict };
}

const INITIAL_RECORD: DraftSyncRecord = { version: 1, value: 'Open', isCompleted: false };
const OFFLINE_DRAFT_VALUE = 'In progress';
const SYNCED_VALUE = 'Inspected';
const COMPLETED_VALUE = 'Completed';

const ONLINE: TabletState = { signal: 'online', draft: null };

function draftPayload(draft: SyncDraft): string {
  return `draft · base v${draft.baseVersion}`;
}

function finalLabel(verdict: DraftVerdict, record: DraftSyncRecord): string {
  if (verdict.isAccepted) {
    return `Applied on top as v${record.version}: the job reopens. Nothing errored — the record reverted.`;
  }
  return `Rejected — job already completed. The record stays at v${record.version}.`;
}

/** Every step of the run under one policy, in order. */
export function simulateDraftSync(policy: SyncPolicy): readonly DraftSyncStep[] {
  const v1 = INITIAL_RECORD;
  const staleDraft: SyncDraft = { baseVersion: v1.version, value: OFFLINE_DRAFT_VALUE };
  const v2: DraftSyncRecord = { version: v1.version + 1, value: SYNCED_VALUE, isCompleted: false };
  const v3: DraftSyncRecord = { version: v2.version + 1, value: COMPLETED_VALUE, isCompleted: true };
  const away: TabletState = { signal: 'offline', draft: staleDraft };
  const back: TabletState = { signal: 'reconnecting', draft: staleDraft };
  const pushed = applyDraft(v3, staleDraft, policy);

  return [
    {
      kind: 'download',
      label: `Both tablets download the work order at v${v1.version}.`,
      record: v1,
      tablets: { A: ONLINE, B: ONLINE },
      messages: [
        { from: 'server', to: 'A', payload: `v${v1.version}`, delivery: 'accepted' },
        { from: 'server', to: 'B', payload: `v${v1.version}`, delivery: 'accepted' },
      ],
      outcome: 'pending',
    },
    {
      kind: 'go-offline',
      label: `Tablet A loses signal at sea and keeps working on a draft of v${v1.version}.`,
      record: v1,
      tablets: { A: away, B: ONLINE },
      messages: [],
      outcome: 'pending',
    },
    {
      kind: 'sync',
      label: `Tablet B logs the inspection and syncs v${v2.version}.`,
      record: v2,
      tablets: { A: away, B: ONLINE },
      messages: [{ from: 'B', to: 'server', payload: `v${v2.version}`, delivery: 'accepted' }],
      outcome: 'pending',
    },
    {
      kind: 'complete',
      label: `Tablet B completes the job: v${v3.version}, closed.`,
      record: v3,
      tablets: { A: away, B: ONLINE },
      messages: [{ from: 'B', to: 'server', payload: 'complete', delivery: 'accepted' }],
      outcome: 'pending',
    },
    {
      kind: 'reconnect',
      label: `Days later, tablet A reconnects — still holding its v${staleDraft.baseVersion} draft.`,
      record: v3,
      tablets: { A: back, B: ONLINE },
      messages: [],
      outcome: 'pending',
    },
    {
      kind: 'push-draft',
      label: finalLabel(pushed.verdict, pushed.record),
      record: pushed.record,
      tablets: { A: { signal: 'online', draft: staleDraft }, B: ONLINE },
      messages: [
        {
          from: 'A',
          to: 'server',
          payload: draftPayload(staleDraft),
          delivery: pushed.verdict.isAccepted ? 'accepted' : 'rejected',
        },
      ],
      outcome: pushed.verdict.isAccepted ? 'reverted' : 'rejected',
    },
  ];
}

/** How many steps a run has, the same under either policy. */
export const DRAFT_SYNC_STEP_COUNT = simulateDraftSync('last-write-wins').length;

/** The run's ending in one sentence, for announcing once a reader replays it. */
export function describeDraftSyncOutcome(policy: SyncPolicy): string {
  const last = simulateDraftSync(policy).at(-1);
  const prefix = policy === 'last-write-wins' ? 'Without ownership' : 'With draft ownership';
  return `${prefix}: ${last?.label ?? ''}`;
}
