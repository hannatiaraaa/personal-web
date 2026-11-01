import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { nextFocusKey, scrollByHand } from './support/input';
import { shouldPin } from './support/approved-modes';

/**
 * The offline sync simulator on the draft-ownership case study, as a reader
 * meets it: where it pins the run plays as the page scrolls, elsewhere it plays
 * by itself once in view; the policy toggle replays it to the other ending, the
 * event log tells it in text, and under reduced motion every ending is simply
 * there. The fit matrix is e2e/scene-fit.spec.ts.
 */

const ROUTE = '/work/offline-draft-ownership';
const LAST_STEP = 5;
const WHEEL_STEP_PX = 120;
const MAX_WHEEL_STEPS = 80;
const SETTLE_MS = 120;
/** Six steps on a clock of under a second each, with room for a slow engine. */
const REPLAY_TIMEOUT_MS = 12_000;
/** Shorter than the outcome's entrance delay, so a held-back entrance fails it. */
const STILL_TIMEOUT_MS = 400;

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

function scene(page: Page) {
  return page.locator('.draft-sync-scene[data-scene]');
}

function eventLog(page: Page) {
  return page.getByRole('group', { name: 'Event log' });
}

/** The step on screen, as the event log marks it for assistive tech. */
async function currentStep(page: Page): Promise<number> {
  return eventLog(page)
    .getByRole('listitem')
    .evaluateAll((items) => items.findIndex((item) => item.getAttribute('aria-current') === 'step'));
}

function outcome(page: Page) {
  return page.locator('.draft-sync-outcome');
}

function policyButton(page: Page, name: 'Without ownership' | 'With draft ownership') {
  return page.getByRole('group', { name: 'Sync policy' }).getByRole('button', { name, exact: true });
}

/** Brings the simulator a screen ahead of the reader, which loads it, and waits for it. */
async function loadSimulator(page: Page): Promise<void> {
  await page.evaluate(() => {
    const slot = document.querySelector('.draft-sync');
    if (slot) {
      const top = slot.getBoundingClientRect().top + window.scrollY - window.innerHeight;
      window.scrollTo({ top, behavior: 'instant' });
    }
  });
  await expect(policyButton(page, 'With draft ownership')).toBeEnabled();
}

/** Puts the controls on screen without scrolling the scene afterwards, so a replay is not cut short. */
async function showControls(page: Page): Promise<void> {
  const controls = page.getByRole('group', { name: 'Sync policy' });
  await controls.evaluate((group) => group.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(controls).toBeInViewport();
}

function pins(page: Page): boolean {
  return shouldPin(page);
}

test.describe('scroll', () => {
  test.skip(({ page }) => !pins(page), 'the run follows the scroll only where it pins');

  test('scrolling by hand plays the run from the download to the stale write', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await expect.poll(() => currentStep(page)).toBe(0);
    await expect(outcome(page)).toContainText(/step 1 of 6/i);

    const seen: number[] = [];
    for (let wheel = 0; wheel < MAX_WHEEL_STEPS; wheel += 1) {
      const step = await currentStep(page);
      if (seen.at(-1) !== step) seen.push(step);
      if (step === LAST_STEP) break;
      await scrollByHand(page, WHEEL_STEP_PX);
      await page.waitForTimeout(SETTLE_MS);
    }

    expect(seen[0]).toBe(0);
    expect(seen.at(-1)).toBe(LAST_STEP);
    expect(seen.length).toBeGreaterThanOrEqual(3);
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    await expect(outcome(page)).toContainText('Records keep reverting.');
  });
});

test.describe('in flow', () => {
  test.skip(({ page }) => pins(page), 'the run follows the scroll where it pins');

  test('nothing pins; the run waits on its first step and plays to the end once the drawing is in view', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await expect.poll(() => currentStep(page)).toBe(0);
    expect(await page.locator('.draft-sync-frame').evaluate((node) => getComputedStyle(node).position)).not.toBe(
      'sticky',
    );

    await page
      .locator('.draft-sync-stage')
      .evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => currentStep(page), { timeout: REPLAY_TIMEOUT_MS }).toBe(LAST_STEP);
    await expect(outcome(page)).toContainText('Records keep reverting.');
  });
});

test.describe('policy toggle', () => {
  test('replays the run to the rejection, and back to the revert', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await showControls(page);

    await policyButton(page, 'With draft ownership').click();
    await expect(policyButton(page, 'With draft ownership')).toHaveAttribute('aria-pressed', 'true');
    await expect(policyButton(page, 'Without ownership')).toHaveAttribute('aria-pressed', 'false');
    await expect(outcome(page)).toContainText(/rejected — job already completed/i, { timeout: REPLAY_TIMEOUT_MS });
    await expect(page.locator('.draft-sync-stage svg')).toHaveAttribute('aria-label', /rejects its draft/);

    await policyButton(page, 'Without ownership').click();
    await expect(outcome(page)).toContainText(/reverted/i, { timeout: REPLAY_TIMEOUT_MS });
    await expect(outcome(page)).toContainText('Records keep reverting.');
  });

  test('is operable from the keyboard, and the replay too', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await showControls(page);

    await policyButton(page, 'Without ownership').focus();
    await page.keyboard.press(nextFocusKey(page));
    await expect(policyButton(page, 'With draft ownership')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(policyButton(page, 'With draft ownership')).toHaveAttribute('aria-pressed', 'true');
    await expect(outcome(page)).toContainText(/rejected/i, { timeout: REPLAY_TIMEOUT_MS });

    await page.keyboard.press(nextFocusKey(page));
    const replay = page.getByRole('button', { name: 'Replay' });
    await expect(replay).toBeFocused();
    await page.keyboard.press('Space');
    await expect(outcome(page)).toContainText(/step 1 of 6/i);
    await expect(outcome(page)).toContainText(/rejected/i, { timeout: REPLAY_TIMEOUT_MS });
  });

  test('skips a playing run to its ending, and keeps keyboard focus where it was', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await showControls(page);

    const replay = page.getByRole('button', { name: 'Replay' });
    const skip = page.getByRole('button', { name: 'Skip' });
    // Pinned, the scroll plays the run, as it did before the run could play by itself: no Skip.
    if (pins(page)) {
      await expect(skip).toBeHidden();
      return;
    }
    await replay.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press(nextFocusKey(page));
    await expect(skip).toBeFocused();
    await page.keyboard.press('Space');

    await expect.poll(() => currentStep(page)).toBe(LAST_STEP);
    await expect(outcome(page)).toContainText('Records keep reverting.');
    expect(await page.evaluate(() => document.activeElement?.closest('.draft-sync-controls') !== null)).toBe(true);
  });

  test('announces the ending of a replay the reader asked for', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);
    await showControls(page);

    const live = page.locator('.draft-sync-frame [aria-live="polite"]');
    await expect(live).toHaveText('');
    await policyButton(page, 'With draft ownership').click();
    await expect(live).toContainText(/with draft ownership: rejected/i, { timeout: REPLAY_TIMEOUT_MS });
  });
});

test.describe('event log', () => {
  test('tells every step in text, with the one on screen marked', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);

    const log = eventLog(page);
    await expect(log.getByRole('listitem')).toHaveCount(6);
    await expect(log.locator('[aria-current="step"]')).toHaveCount(1);
    await expect(log).toContainText('Both tablets download the work order at v1.');
    await expect(log).toContainText(/reconnects/);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows each ending at once, and the toggle still works', async ({ page }) => {
    await page.goto(ROUTE);
    await loadSimulator(page);

    expect(await currentStep(page)).toBe(LAST_STEP);
    await expect(outcome(page)).toContainText('Records keep reverting.');

    await showControls(page);
    await policyButton(page, 'With draft ownership').click();
    await expect(outcome(page)).toContainText(/rejected — job already completed/i, { timeout: 1_000 });
    await page.getByRole('button', { name: 'Replay' }).click();
    await expect(outcome(page)).toContainText(/rejected — job already completed/i, { timeout: 1_000 });
    // The stamp rests in place at once: no entrance held back by a delay.
    await expect(page.locator('.draft-sync-stage').getByText('REJECTED', { exact: true })).toBeVisible({
      timeout: STILL_TIMEOUT_MS,
    });

    // Nothing pins: the scene is no taller than its frame.
    const heights = await scene(page).evaluate((element) => ({
      scene: element.getBoundingClientRect().height,
      frame: element.querySelector('.draft-sync-frame')?.getBoundingClientRect().height ?? 0,
    }));
    expect(heights.scene).toBeLessThanOrEqual(heights.frame + 1);
  });
});

test.describe('layout', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(ROUTE);
      await loadSimulator(page);
      await eventLog(page).evaluate((log) => log.scrollIntoView({ behavior: 'instant' }));
      await expect(eventLog(page)).toBeInViewport();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('the live simulator takes exactly the stand-in’s place', async ({ page }) => {
    await page.goto(ROUTE);
    // Layout height, not the painted box: the part around it scales a hair as it enters.
    const height = () =>
      page.locator('.draft-sync-js').evaluate((element) => (element instanceof HTMLElement ? element.offsetHeight : 0));
    // The stand-in: the same frame, its controls not yet live.
    await expect(policyButton(page, 'With draft ownership')).toBeDisabled();
    const before = await height();
    await loadSimulator(page);
    expect(await height()).toBe(before);
  });
});

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} theme: the simulator has no serious or critical violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(ROUTE);
    await loadSimulator(page);
    await showControls(page);

    const results = await new AxeBuilder({ page })
      .include('.draft-sync')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
  });
}
