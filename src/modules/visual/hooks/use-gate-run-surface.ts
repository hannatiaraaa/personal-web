'use client';

// Client: a hook — React state and effects, used only by client components.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { DARK_SCHEME_QUERY } from '@/common/lib/media-queries';
import { buildGateSuite, buildPermissionMatrix } from '@/modules/visual/lib/gate-run';
import { layoutGateRun, type GateLayout } from '@/modules/visual/lib/gate-run-layout';
import { formatGateCounter, gateRunStateAt } from '@/modules/visual/lib/gate-run-timeline';
import { paintGateRun, type GatePalette } from './paint-gate-run';

const MAX_DPR = 2;
/** Written on the mount once the canvas has painted, so the stand-in under it can step aside. */
const MOUNT_SELECTOR = '.gate-run-mount';
const LIVE_PAINTED_ATTRIBUTE = 'data-live-painted';
const BEAT_ATTRIBUTE = 'data-gate-beat';

const SUITE = buildGateSuite();
const MATRIX = buildPermissionMatrix();

/** The picture's colours, read from the design tokens in effect on the figure. */
function readPalette(element: Element): GatePalette {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(name).trim();

  return {
    pass: token('--pass'),
    debt: token('--caution'),
    pending: token('--ink-faint'),
    held: token('--ink-muted'),
    line: token('--line'),
    head: token('--signal-bright'),
    surface: token('--surface'),
    label: token('--ink-faint'),
  };
}

/**
 * The gate-run canvas as a surface to draw on: sized to its box at a capped
 * pixel ratio, coloured from the theme in effect, and painted at whatever
 * `progress` holds whenever `requestFrame` is called — at most once a frame.
 *
 * Each frame also writes the running counter's text and the current beat as
 * `data-gate-beat` on the figure, directly to the DOM: the captions and the
 * stamp follow it in CSS, and nothing re-renders per frame.
 */
export function useGateRunSurface(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  counterRef: RefObject<HTMLElement | null>,
  progress: RefObject<number>,
): { readonly isPainted: boolean; readonly requestFrame: () => void } {
  const [isPainted, setPainted] = useState(false);
  const render = useRef<() => void>(() => undefined);
  const requestFrame = useCallback(() => render.current(), []);

  // Canvas, palette and sizing. Built once; every other effect only asks it to render.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const root = canvas.closest('.gate-run') ?? canvas;

    let palette = readPalette(root);
    let fontFamily = getComputedStyle(canvas).fontFamily;
    let width = 0;
    let height = 0;
    let layout: GateLayout = layoutGateRun(SUITE, MATRIX, { width, height });
    let frame = 0;
    let lastCounter = '';

    const draw = () => {
      frame = 0;
      const state = gateRunStateAt(SUITE, MATRIX, progress.current);
      paintGateRun(context, { width, height, layout, suite: SUITE, matrix: MATRIX, state, palette, fontFamily });

      const beat = String(state.beat);
      if (root.getAttribute(BEAT_ATTRIBUTE) !== beat) root.setAttribute(BEAT_ATTRIBUTE, beat);
      const counter = formatGateCounter(state, SUITE);
      if (counter !== lastCounter && counterRef.current) {
        counterRef.current.textContent = counter;
        lastCounter = counter;
      }
    };

    render.current = () => {
      if (frame === 0) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = layoutGateRun(SUITE, MATRIX, { width, height });
      // Assigning a size clears the canvas; repaint now rather than on the next frame.
      draw();
      setPainted(true);
      canvas.closest(MOUNT_SELECTOR)?.setAttribute(LIVE_PAINTED_ATTRIBUTE, '');
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // The palette is CSS tokens, so a theme change — the toggle or the system — re-reads it.
    const applyTheme = () => {
      palette = readPalette(root);
      fontFamily = getComputedStyle(canvas).fontFamily;
      render.current();
    };
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const systemTheme = window.matchMedia(DARK_SCHEME_QUERY);
    systemTheme.addEventListener('change', applyTheme);

    return () => {
      cancelAnimationFrame(frame);
      render.current = () => undefined;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener('change', applyTheme);
    };
  }, [canvasRef, counterRef, progress]);

  return { isPainted, requestFrame };
}
