import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { caseStudies } from '../src/content/case-studies';
import { heroIntro } from '../src/content/hero';
import { scrollByHand } from './support/input';
import { shouldPin } from './support/approved-modes';

/**
 * The home page's opening scene: a report typed out, struck through, and
 * replaced by what it was. What a reader can observe — the beat it is on, what
 * is legible where, and that the finished scene is what a reader without
 * motion or scripts gets.
 */

const SCENE = '.hero-intro';
const LAST_BEAT = '3';
const WHEEL_STEP = 140;
const MAX_WHEELS = 80;
const study = caseStudies.find((candidate) => candidate.slug === heroIntro.studySlug);

const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function beat(page: Page): Promise<number> {
  return Number(await page.locator(SCENE).getAttribute('data-beat'));
}

/** Jumps to a point of the scene, as share of its pinned travel. */
async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate((share) => {
    const scene = document.querySelector('.hero-intro');
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    window.scrollTo({ top: top + share * (rect.height - window.innerHeight), behavior: 'instant' });
  }, progress);
}

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/** Every typed character and every risen word is fully shown, and the report struck through: the finished scene. */
async function expectFinishedScene(page: Page) {
  const hidden = await page.locator(`${SCENE} .hero-intro-char, ${SCENE} .hero-intro-rise`).evaluateAll((nodes) =>
    nodes.filter((node) => {
      const style = getComputedStyle(node);
      const { m42 } = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
      return Number(style.opacity) < 1 || Math.abs(m42) > 0.5;
    }),
  );
  expect(hidden).toHaveLength(0);

  const unstruck = await page.locator(`${SCENE} .hero-intro-word`).evaluateAll((nodes) =>
    nodes.filter((node) => {
      const { transform } = getComputedStyle(node, '::after');
      return transform !== 'none' && new DOMMatrix(transform).a < 1;
    }),
  );
  expect(unstruck).toHaveLength(0);

  const card = page.locator(`${SCENE} .hero-intro-card`);
  await expect(card).toBeVisible();
  await expect(card).toContainText(study?.reported ?? '');
  await expect(card).toContainText(study?.title ?? '');
}

function pins(page: Page): boolean {
  return shouldPin(page);
}

test.describe('as the reader scrolls', () => {
  test.skip(({ page }) => !pins(page), 'the scene is scrubbed only where it pins');

  test('the beats advance in order: name, report, strike, resolve', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => beat(page)).toBe(0);

    const seen = [0];
    for (let wheel = 0; wheel < MAX_WHEELS && seen.at(-1) !== Number(LAST_BEAT); wheel += 1) {
      await scrollByHand(page, WHEEL_STEP);
      await page.waitForTimeout(60);
      const current = await beat(page);
      if (current !== seen.at(-1)) seen.push(current);
    }

    expect(seen).toEqual([0, 1, 2, 3]);
  });

  test('the scroll cue is there at the top and gone once the scene moves', async ({ page }) => {
    await page.goto('/');
    const cue = page.locator(`${SCENE} .hero-intro-cue`);
    await expect.poll(() => cue.evaluate((node) => getComputedStyle(node).opacity)).toBe('1');

    await scrollByHand(page, WHEEL_STEP);
    await expect.poll(() => cue.evaluate((node) => getComputedStyle(node).opacity)).toBe('0');
  });

  test('by the time it is struck, the report is fully typed', async ({ page }) => {
    await page.goto('/');
    await scrollToProgress(page, 0.5);
    await expect(page.locator(SCENE)).toHaveAttribute('data-beat', '2');

    // Each character steps in over a short transition; poll until they rest.
    const shown = () =>
      page
        .locator(`${SCENE} .hero-intro-char`)
        .evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).opacity === '1').length);
    await expect.poll(shown).toBe(Array.from((study?.reported ?? '').replace(/\s+/g, '')).length);
  });
});

test.describe('where it cannot pin', () => {
  test.skip(({ page }) => pins(page), 'the scene is scrubbed where it pins');

  test('the scene is in flow and strikes the report by itself, finished without a scroll', async ({ page }) => {
    await page.goto('/');
    const stagePosition = await page
      .locator(`${SCENE} .hero-intro-stage`)
      .evaluate((node) => getComputedStyle(node).position);
    expect(stagePosition).not.toBe('sticky');
    await expect(page.locator(SCENE)).toHaveAttribute('data-beat', LAST_BEAT);
    // The last beat starts before the run ends, and each line settles over a transition.
    await expect(() => expectFinishedScene(page)).toPass();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe('every viewport', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: the name at load, the whole card at the end, nothing sideways`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const header = await page.locator('header').first().boundingBox();
      const name = await page.locator('h1').boundingBox();
      expect(header).not.toBeNull();
      expect(name).not.toBeNull();
      expect(name!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      expect(name!.y + name!.height).toBeLessThanOrEqual(viewport.height);
      expect(await overflow(page)).toBeLessThanOrEqual(0);

      // The last pinned frame: everything the scene says is on screen at once,
      // below the header and above the fold — nothing hides behind anything.
      await scrollToProgress(page, 0.99);
      await expect(page.locator(SCENE)).toHaveAttribute('data-beat', LAST_BEAT);
      const card = await page.locator(`${SCENE} .hero-intro-card`).boundingBox();
      const pinnedName = await page.locator('h1').boundingBox();
      expect(card).not.toBeNull();
      expect(pinnedName).not.toBeNull();
      expect(pinnedName!.y).toBeGreaterThanOrEqual(header!.height);
      expect(card!.y + card!.height).toBeLessThanOrEqual(viewport.height);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the finished scene, at once, in flow, with the pool still', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeInViewport();
    await expectFinishedScene(page);
    await expect(page.locator(`${SCENE} .hero-intro-cue`)).toHaveCSS('opacity', '0');
    await expect(page.locator('body')).toContainText('still — touch to ripple');

    const sceneHeight = await page.locator(SCENE).evaluate((node) => node.getBoundingClientRect().height);
    const viewportHeight = page.viewportSize()?.height ?? 0;
    expect(sceneHeight).toBeLessThan(viewportHeight * 1.5);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the finished scene is what the HTML says, readable in flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeInViewport();
    await expect(page.locator('h1')).toHaveText('Hanna Tiara Andarlia');
    await expectFinishedScene(page);

    const sceneHeight = await page.locator(SCENE).evaluate((node) => node.getBoundingClientRect().height);
    const viewportHeight = page.viewportSize()?.height ?? 0;
    expect(sceneHeight).toBeLessThan(viewportHeight * 1.5);
  });
});

for (const theme of ['light', 'dark'] as const) {
  test(`mid-scene, ${theme}: no serious or critical axe violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    await scrollToProgress(page, 0.65);
    await expect(page.locator(SCENE)).toHaveAttribute('data-beat', '2');
    // Let the stepped lines finish their short transitions.
    await page.waitForTimeout(700);

    const results = await new AxeBuilder({ page })
      .include(SCENE)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
  });
}
