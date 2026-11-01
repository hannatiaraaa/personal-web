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
