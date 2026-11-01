'use client';

// Client: measures the scene on scroll; its server-rendered children animate off `--progress` in CSS.

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useAutoRun } from '@/common/hooks/use-auto-run';
import { useMediaQuery } from '@/common/hooks/use-media-query';
import { useSceneProgress, writeSceneProgress } from '@/common/hooks/use-scene-progress';
import type { AutoRunSpan } from '@/common/lib/auto-run';
import type { SceneMode } from '@/common/lib/scene-progress';

const EVERY_SCREEN = 'all';
const NO_RUN: AutoRunSpan = { from: 1, durationMs: 0 };

type SceneTag = 'div' | 'section' | 'figure' | 'article';

type Props = {
  /** The element rendered. A `section` or `article` needs a heading or a `label`. */
  as?: SceneTag;
  /** `pinned` for a tall section with a sticky child; `through` for plain flow. */
  mode: SceneMode;
  /** Ascending start points, 0–1, of the scene's beats; written as `data-beat`. */
  beats?: readonly number[];
  /** A media query outside which the scene is not scrubbed by scroll. */
  liveQuery?: string;
  /**
   * Outside `liveQuery`, play the scene once by itself on a clock as it comes
   * into view, over this span, instead of resting finished.
   */
  autoRun?: AutoRunSpan;
  /**
   * The beat rendered on the server, when `style` starts the scene somewhere
   * other than its finished state. Defaults to the last beat.
   */
  initialBeat?: number;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  /**
   * Names the scene for assistive tech. A `div` becomes a labelled group; any
   * other tag keeps its own role, so a `figure` stays a figure.
   */
  label?: string;
};

/**
 * A scroll-driven scene that runs in every browser.
 *
 * Writes `--progress` (0–1) and, with `beats`, `data-beat` on its own element;
 * children animate off those in CSS — `transform` and `opacity` only. Before
 * hydration, without JavaScript and under reduced motion, `--progress` is 1 and
 * `data-beat` the last beat, so the scene is read in its finished state.
 * Outside `liveQuery` it is static, or with `autoRun` plays once on a clock.
 */
export function ScrollScene({
  as: Tag = 'div',
  mode,
  beats,
  liveQuery = EVERY_SCREEN,
  autoRun,
  initialBeat,
  className,
  style,
  children,
  label,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  // A callback ref accepts any of the tags, which an object ref typed to one cannot.
  const attach = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);
  const isLive = useMediaQuery(liveQuery);
  const isClocked = autoRun !== undefined && !isLive;
  useSceneProgress(ref, mode, beats, liveQuery, isClocked ? autoRun.from : undefined);
  const { stop } = useAutoRun(ref, {
    span: autoRun ?? NO_RUN,
    autoplay: isClocked,
    onProgress: (value) => {
      if (ref.current) writeSceneProgress(ref.current, value, beats);
    },
  });
  // A screen grown into `liveQuery` hands the scene to the scroll.
  useEffect(() => {
    if (isLive) stop();
  }, [isLive, stop]);

  const finalBeat = beats && beats.length > 0 ? beats.length - 1 : undefined;

  return (
    <Tag
      ref={attach}
      role={label && Tag === 'div' ? 'group' : undefined}
      aria-label={label}
      data-scene={mode}
      data-beat={initialBeat ?? finalBeat}
      className={`scroll-scene ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
