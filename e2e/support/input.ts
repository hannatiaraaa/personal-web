import { test, type Page } from '@playwright/test';

/**
 * Input as a reader on each engine gives it.
 *
 * Safari's Tab stops only at form controls by default; a keyboard reader
 * reaches links with Option+Tab, and Playwright's WebKit keeps that default.
 * Mobile WebKit has no wheel, and Playwright has no swipe — the nearest a test
 * gets to a reader's thumb is a touchstart (which the stories read as "the
 * reader is scrolling on purpose") followed by the scroll itself.
 */

function isWebKit(page: Page): boolean {
  return page.context().browser()?.browserType().name() === 'webkit';
}

/** The key that moves focus to the next link, as a keyboard reader on this engine presses it. */
export function nextFocusKey(page: Page): string {
  return isWebKit(page) ? 'Alt+Tab' : 'Tab';
}

/** Scrolls by hand: the wheel where there is one, a swipe where there is not. */
export async function scrollByHand(page: Page, deltaY: number): Promise<void> {
  if (!(isWebKit(page) && test.info().project.use.isMobile)) {
    await page.mouse.wheel(0, deltaY);
    return;
  }
  await page.evaluate((dy) => {
    window.dispatchEvent(new Event('touchstart'));
    window.scrollBy(0, dy);
  }, deltaY);
}

/**
 * How long the scroll position must hold, in rendered frames and in time, to
 * count as at rest. Frames, so a slow renderer is waited out rather than read
 * mid-scroll; time, because a smooth scroll can start a few frames after the
 * wheel that asked for it.
 */
const STILL_FRAMES = 3;
const STILL_MS = 120;

/** Waits until a hand scroll has come to rest: a wheel may scroll smoothly, past the moment it was sent. */
export async function settleScroll(page: Page): Promise<void> {
  await page.evaluate(
    ({ stillFrames, stillMs }) =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let still = 0;
        let since = performance.now();
        const tick = (now: number) => {
          const y = window.scrollY;
          if (y !== last) {
            last = y;
            still = 0;
            since = now;
          } else {
            still += 1;
          }
          if (still >= stillFrames && now - since >= stillMs) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { stillFrames: STILL_FRAMES, stillMs: STILL_MS },
  );
}

/** Waits for the next rendered frame, so a wheel just sent has moved the page before it is measured. */
export async function nextFrame(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}
