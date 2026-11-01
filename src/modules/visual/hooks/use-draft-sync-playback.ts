'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useAutoRun } from '@/common/hooks/use-auto-run';
import { useReducedMotion } from '@/common/hooks/use-reduced-motion';
import { useSceneAttribute } from '@/common/hooks/use-scene-attribute';
import { autoRunStep, type AutoRunSpan } from '@/common/lib/auto-run';
import {
  DRAFT_SYNC_STEP_COUNT,
  describeDraftSyncOutcome,
  simulateDraftSync,
  type DraftSyncStep,
  type SyncPolicy,
} from '@/modules/visual/lib/draft-sync';

const SCENE_SELECTOR = '[data-scene]';
const OBSERVED = ['data-beat'] as const;
/** Long enough to watch a message cross, short enough that six steps take under five seconds. */
const STEP_MS = 800;
const RUN: AutoRunSpan = { from: 0, durationMs: STEP_MS * DRAFT_SYNC_STEP_COUNT };
const FIRST_STEP = 0;
const LAST_STEP = DRAFT_SYNC_STEP_COUNT - 1;

export type DraftSyncPlayback = {
  readonly policy: SyncPolicy;
  readonly steps: readonly DraftSyncStep[];
  /** The step on screen: the clock's while it has run, otherwise the scroll's. */
  readonly beat: number;
  /** Changes on every replay, so the same step can be played twice. */
  readonly run: number;
  readonly announcement: string;
  /**
   * False until the step first changes after mount. The simulator replaces a
   * stand-in already showing the same step, so its outcome animations would
   * only replay what the reader just saw.
   */
  readonly hasMoved: boolean;
  readonly isRunning: boolean;
  readonly selectPolicy: (policy: SyncPolicy) => void;
  readonly replay: () => void;
  readonly skip: () => void;
};

type Options = {
  /** The frame, inside the scene whose `data-beat` it follows. */
  readonly frameRef: RefObject<HTMLElement | null>;
  /** The drawing: the run plays by itself once it is mostly on screen. */
  readonly stageRef: RefObject<HTMLElement | null>;
  /** Scrubbed by scroll at `pin`; elsewhere the run plays on the clock. */
  readonly isPinned: boolean;
};

/**
 * The simulator's policy and step, from one of two clocks. Pinned, the step
 * follows the scene's `data-beat` through a MutationObserver (it changes six
 * times a scene, not every frame). Elsewhere the run waits on its first step
 * and plays once by itself as the drawing comes into view. A replay, a policy
 * change or a skip runs the same clock anywhere; pinned, scrolling on hands the
 * step back. Under reduced motion every run lands on its end. Only a run the
 * reader asked for is announced.
 */
export function useDraftSyncPlayback({ frameRef, stageRef, isPinned }: Options): DraftSyncPlayback {
  const isReduced = useReducedMotion();
  const [policy, setPolicy] = useState<SyncPolicy>('last-write-wins');
  const [scrollBeat, setScrollBeat] = useState(LAST_STEP);
  const [clockBeat, setClockBeat] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [hasMoved, setHasMoved] = useState(false);
  // The scene may rewrite the beat it already had; only a different one is a move.
  const mountBeat = useRef<string | null | undefined>(undefined);
  const isRequested = useRef(false);
  // Read by the clock's callback, which is set once; the policy a run was asked under.
  const policyRef = useRef(policy);
  useEffect(() => {
    policyRef.current = policy;
  }, [policy]);

  const onProgress = useCallback((progress: number) => {
    const next = autoRunStep(progress, DRAFT_SYNC_STEP_COUNT);
    setClockBeat(next);
    setHasMoved(true);
    if (next === LAST_STEP && isRequested.current) {
      isRequested.current = false;
      setAnnouncement(describeDraftSyncOutcome(policyRef.current));
    }
  }, []);

  const { isRunning, play, skip: finish, stop } = useAutoRun(stageRef, { span: RUN, autoplay: !isPinned, onProgress });

  useSceneAttribute(frameRef, SCENE_SELECTOR, OBSERVED, (scene) => {
    const raw = scene.getAttribute('data-beat');
    if (mountBeat.current === undefined) mountBeat.current = raw;
    const value = Number(raw);
    if (!Number.isInteger(value)) return;
    const isMove = raw !== mountBeat.current;
    if (isMove) setHasMoved(true);
    // Pinned, any change of beat is the reader scrolling, which takes the step back from a run.
    if (isMove || isPinned) {
      stop();
      setClockBeat(null);
    }
    setScrollBeat(value);
  });

  const request = useCallback(() => {
    isRequested.current = true;
    setRun((value) => value + 1);
    setHasMoved(true);
    setAnnouncement('');
  }, []);

  const replay = useCallback(() => {
    request();
    play();
  }, [request, play]);

  const selectPolicy = useCallback(
    (next: SyncPolicy) => {
      policyRef.current = next;
      setPolicy(next);
      replay();
    },
    [replay],
  );

  const skip = useCallback(() => {
    isRequested.current = true;
    finish();
  }, [finish]);

  const steps = useMemo(() => simulateDraftSync(policy), [policy]);
  // Below `pin`, before its run, the drawing waits on the first step rather than giving the ending away.
  const isWaiting = !isPinned && !isReduced && !hasMoved;
  const beat = clockBeat ?? (isWaiting ? FIRST_STEP : scrollBeat);

  return {
    policy,
    steps,
    beat,
    run,
    announcement,
    hasMoved,
    isRunning,
    selectPolicy,
    replay,
    skip,
  };
}
