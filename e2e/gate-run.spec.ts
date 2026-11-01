import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { figures } from '../src/content/facts';
import { releaseGateRunCopy } from '../src/content/interactives';
import { buildGateSuite, buildPermissionMatrix } from '../src/modules/visual/lib/gate-run';
import { formatGateCounter, gateRunStateAt } from '../src/modules/visual/lib/gate-run-timeline';
import { scrollByHand, settleScroll } from './support/input';

/**
 * The release gate run on its case study: pinned and scrubbed by scroll at the
 * `pin` size, played on a clock below it, finished and still under reduced
 * motion and without JavaScript. Asserted as a reader sees it — which beat the
 * figure is on, what the counter reads, that the canvas has paint on it.
 */

const ROUTE = '/work/release-gate-from-zero';
const PINNED = { width: 1280, height: 800 } as const;
const PHONE = { width: 390, height: 844 } as const;
const BEATS = releaseGateRunCopy.captions.map((_, index) => index);
const LAST_BEAT = BEATS.length - 1;
const WHEEL_STEP_PX = 240;
const MAX_WHEEL_STEPS = 90;

const SUITE = buildGateSuite();
const FINAL_COUNTER = formatGateCounter(gateRunStateAt(SUITE, buildPermissionMatrix(), 1), SUITE);

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

function figure(page: Page): Locator {
  return page.locator('figure.gate-run');
}

function liveCanvas(page: Page): Locator {
  return page.locator('.gate-run-live canvas');
}

/** The caption for `beat`, found by its headline. */
function caption(page: Page, beat: number): Locator {
  return figure(page).getByText(releaseGateRunCopy.captions[beat]?.headline ?? '', { exact: true });
}

/** The opacity a caption is drawn at: it fades as a block, around its headline. */
function captionOpacity(page: Page, beat: number): Promise<string> {
  return caption(page, beat).evaluate((element) => getComputedStyle(element.parentElement ?? element).opacity);
}

/**
 * The beat whose caption a reader sees whole. While one caption fades out and
 * the next fades in, neither is; this waits out that moment.
 */
async function beatShown(page: Page): Promise<number> {
  let shown = -1;
  await expect
    .poll(async () => {
      shown = -1;
      for (const beat of BEATS) {
        if ((await caption(page, beat).isVisible()) && (await captionOpacity(page, beat)) === '1') shown = beat;
      }
      return shown;
    })
    .not.toBe(-1);
  return shown;
}

/** Waits for the caption of `beat` to show, at rest — axe and a reader see it whole, not part-way faded in. */
async function expectBeat(page: Page, beat: number, timeout?: number): Promise<void> {
  await expect(caption(page, beat)).toBeVisible({ timeout });
  await expect.poll(() => captionOpacity(page, beat)).toBe('1');
}

/** Waits until a locator's transitions have finished: it is at rest. */
async function settleAnimations(locator: Locator): Promise<void> {
  await locator.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
}

function liveCounter(page: Page): Locator {
  return page.locator('.gate-run-live .gate-run-counter > span').last();
}

/**
 * Brings the figure's top to just under the header, which arms and paints the
 * canvas. Painted means the stand-in has stepped aside: the canvas is then the
 * figure's only picture.
 */
async function reachFigure(page: Page): Promise<void> {
  await figure(page).evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' });
  });
  await expect(liveCanvas(page)).toBeVisible();
  await expect(figure(page).getByRole('img')).toHaveCount(1);
}

/**
 * The run at rest at its end, however this viewport drives it. Pinned, it is
 * scrolled through. Played, it rests finished until it plays once by itself on
 * coming into view, so the run is skipped only once that has started:
 * deciding earlier reads the resting picture just before the autoplay hides it.
 */
async function reachFinal(page: Page): Promise<void> {
  const skip = page.getByRole('button', { name: 'Skip to the result' });
  const isPlayer = await skip.or(page.getByRole('button', { name: 'Replay the run' })).isVisible();
  if (isPlayer) {
    await figure(page).scrollIntoViewIfNeeded();
    await skip.click();
  } else {
    await figure(page).evaluate((element) => {
      const { bottom } = element.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, bottom + window.scrollY - window.innerHeight), behavior: 'instant' });
    });
  }
  await expectBeat(page, LAST_BEAT);
  // The stamp lands on a transition; measure it at rest.
  await settleAnimations(page.locator('.gate-run-live .gate-run-stamp'));
}

/** Opaque pixels on the live canvas, and how many of them are the pass colour. */
async function readPaint(page: Page): Promise<{ opaque: number; pass: number }> {
  return liveCanvas(page).evaluate((canvas) => {
    const context = canvas instanceof HTMLCanvasElement ? canvas.getContext('2d') : null;
    if (!(canvas instanceof HTMLCanvasElement) || !context) return { opaque: -1, pass: -1 };

    // The pass token, resolved to rgb by the engine itself.
    const probe = document.createElement('span');
    probe.style.color = 'var(--pass)';
    canvas.closest('.gate-run')?.append(probe);
    const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/\d+/g) ?? []).map(Number);
    probe.remove();

    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let opaque = 0;
    let pass = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]! < 200) continue;
      opaque += 1;
      if (Math.abs(data[i]! - r) + Math.abs(data[i + 1]! - g) + Math.abs(data[i + 2]! - b) < 40) pass += 1;
    }
    return { opaque, pass };
  });
}

test.describe('pinned: scroll drives the run', () => {
  test.use({ viewport: PINNED });

  test('every beat arrives in order as the reader scrolls, and the counter ends on the full run', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);
    // At the figure's top the run has not started: the report is on screen.
    await expectBeat(page, 0);
    const seen: number[] = [];

    for (let step = 0; step < MAX_WHEEL_STEPS; step += 1) {
      const beat = await beatShown(page);
      if (beat !== -1 && seen.at(-1) !== beat) seen.push(beat);
      if (beat === LAST_BEAT) break;
      await scrollByHand(page, WHEEL_STEP_PX);
      await settleScroll(page);
    }

    expect(seen).toEqual(BEATS);
    await expect(liveCounter(page)).toHaveText(FINAL_COUNTER);
    await expect(page.getByText('Release certified', { exact: true }).last()).toBeVisible();
  });

  test('the frame holds still under the header while the run plays', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);
    const frame = page.locator('.gate-run-frame');

    await scrollByHand(page, 600);
    await settleScroll(page);
    const before = await frame.boundingBox();
    await scrollByHand(page, 600);
    await settleScroll(page);
    const after = await frame.boundingBox();

    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 1))).toBeLessThan(2);
  });

  test('the canvas is painted, in the colour of a pass', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);
    await reachFinal(page);

    // Read after the next frame has been drawn.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const paint = await readPaint(page);
    expect(paint.opaque).toBeGreaterThan(2000);
    expect(paint.pass).toBeGreaterThan(500);
  });
});

test.describe('plain flow: a run on a clock', () => {
  test.use({ viewport: PHONE });

  test('the run plays by itself once in view, can be skipped, and replays', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);
    await figure(page).scrollIntoViewIfNeeded();

    const skip = page.getByRole('button', { name: 'Skip to the result' });
    await expect(skip).toBeVisible();
    await expect(caption(page, LAST_BEAT)).toBeHidden();

    await skip.click();
    await expectBeat(page, LAST_BEAT);
    await expect(liveCounter(page)).toHaveText(FINAL_COUNTER);

    await page.getByRole('button', { name: 'Replay the run' }).click();
    await expect(page.getByRole('button', { name: 'Skip to the result' })).toBeVisible();
    await expect(caption(page, LAST_BEAT)).toBeHidden();
  });

  test('a played run reaches the end on its own', async ({ page }) => {
    test.slow();
    await page.goto(ROUTE);
    await reachFigure(page);
    await figure(page).scrollIntoViewIfNeeded();

    // The run has started: it can be skipped, and the finished caption has given way.
    await expect(page.getByRole('button', { name: 'Skip to the result' })).toBeVisible();
    await expect(caption(page, LAST_BEAT)).toBeHidden();

    await expect(page.getByRole('button', { name: 'Replay the run' })).toBeVisible({ timeout: 20_000 });
    await expectBeat(page, LAST_BEAT);
    await expect(liveCounter(page)).toHaveText(FINAL_COUNTER);
  });
});

test.describe('reduced motion: the finished run, still', () => {
  test.use({ reducedMotion: 'reduce', viewport: PINNED });

  test('nothing pins or plays; the final state is shown and painted', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);

    const height = await figure(page).evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeLessThan(PINNED.height * 1.5);

    await expectBeat(page, LAST_BEAT);
    await expect(page.getByRole('button', { name: 'Skip to the result' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Replay the run' })).toBeVisible();
    await expect(liveCounter(page)).toHaveText(FINAL_COUNTER);
    expect((await readPaint(page)).opaque).toBeGreaterThan(2000);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: PINNED });

  test('the finished picture, the last caption and the published figures are there', async ({ page }) => {
    await page.goto(ROUTE);
    const still = figure(page).getByRole('img').first();
    await still.scrollIntoViewIfNeeded();

    await expect(still).toBeVisible();
    await expect(figure(page).getByText('Release certified without customer data')).toBeVisible();
    const stamp = figure(page).locator('.gate-run-stamp').first();
    await expect(stamp).toBeVisible();
    await expect(stamp).toContainText(`${figures.releaseCases} repeatable cases across ${figures.releaseSpecs} specs`);
    await expect(stamp).toContainText(`${figures.permissionChecks} permission checks per run`);
  });
});

test.describe('the figure states its finding', () => {
  test('the picture says what the run proves, once', async ({ page }) => {
    await page.goto(ROUTE);
    await reachFigure(page);

    const picture = page.getByRole('img', { name: /quarantined by name/ });
    await expect(picture).toHaveCount(1);
    await expect(picture).toHaveAccessibleName(/never counted as passes/);
    await expect(page.getByRole('figure', { name: 'Release gate run, illustrative' })).toBeVisible();
  });
});

test.describe('viewport matrix', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways overflow, and the stamp sits inside the picture`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(ROUTE);
      await reachFigure(page);
      await reachFinal(page);

      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(
        0,
      );

      const frame = await page.locator('.gate-run-frame').boundingBox();
      expect(frame).not.toBeNull();
      expect((frame?.x ?? 0) + (frame?.width ?? 0)).toBeLessThanOrEqual(viewport.width);

      const box = await page.locator('.gate-run-live .gate-run-box').boundingBox();
      const stamp = await page.locator('.gate-run-live .gate-run-stamp').boundingBox();
      expect(box && stamp).toBeTruthy();
      // Rotated a few degrees, so allow the corners a little past the box.
      expect(stamp!.x).toBeGreaterThanOrEqual(box!.x - 8);
      expect(stamp!.x + stamp!.width).toBeLessThanOrEqual(box!.x + box!.width + 8);
    });
  }
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ viewport: PINNED, colorScheme: theme });

    for (const beat of [2, LAST_BEAT]) {
      test(`beat ${beat} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(ROUTE);
        await reachFigure(page);
        await expectBeat(page, 0);

        for (let step = 0; step < MAX_WHEEL_STEPS; step += 1) {
          if ((await beatShown(page)) === beat) break;
          await scrollByHand(page, WHEEL_STEP_PX);
          await settleScroll(page);
        }
        await settleScroll(page);
        await expectBeat(page, beat);
        // The named debt arrives chip by chip; axe reads them at rest.
        const lastChip = figure(page)
          .getByRole('list', { name: releaseGateRunCopy.debtListLabel })
          .getByRole('listitem')
          .last();
        await expect.poll(() => lastChip.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');

        const results = await new AxeBuilder({ page })
          .include('figure.gate-run')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const blocking = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        );

        expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
      });
    }
  });
}
