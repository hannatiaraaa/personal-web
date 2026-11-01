import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { caseStudies } from '../src/content/case-studies';
import { headlineFigures } from '../src/content/facts';
import { tryIt } from '../src/content/try-it';
import { workStory } from '../src/content/work-story';
import { pickStoryStudies, storyAction } from '../src/modules/home/lib/work-story';
import { scrollByHand } from './support/input';

/**
 * The home page's selected work, told as one scroll story: what a reader, a
 * keyboard and a screen reader can observe while it moves — never how it is
 * built. One section: each drawn study a step, each step one way in.
 */

const STORY = pickStoryStudies(caseStudies);
const WHEEL_STEP = 160;
const MAX_WHEELS = 90;

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

function section(page: Page): Locator {
  return page.locator('section[aria-labelledby="problems"]');
}

function stage(page: Page): Locator {
  return page.getByRole('group', { name: workStory.stageLabel });
}

function ctaName(study: (typeof STORY)[number]): string {
  const action = storyAction(study);
  return action.kind === 'try' ? `${tryIt.prefix} — ${tryIt.action[action.interactive]}` : tryIt.read;
}

/** `--on` is 1 once a drawing has drawn itself in, 0 before. */
async function drawnState(element: Locator): Promise<string> {
  return element.evaluate((node) => getComputedStyle(node).getPropertyValue('--on').trim());
}

async function activeStep(page: Page): Promise<number> {
  return Number(await stage(page).getAttribute('data-active-step'));
}

/** Scrolls with the wheel (or a thumb), as a reader would, until the stage reaches `target`. */
async function scrollUntilStep(page: Page, target: number) {
  await page.mouse.move(200, 400);
  for (let i = 0; i < MAX_WHEELS && (await activeStep(page)) < target; i += 1) {
    await scrollByHand(page, WHEEL_STEP);
    await page.waitForTimeout(80);
  }
}

async function scrollToMidStory(page: Page) {
  await page.evaluate(() => {
    const story = document.getElementById('problems')?.closest('section');
    if (!story) return;
    const { top, height } = story.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + top + height / 2 - window.innerHeight / 2, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
}

function offerFigures(page: Page) {
  return page.getByRole('region', { name: 'Evidence and contact' }).locator('dd > span:first-child');
}

async function expectPublishedFigures(page: Page) {
  const shown = await offerFigures(page).evaluateAll((spans: HTMLElement[]) => spans.map((span) => span.innerText));
  expect(shown).toEqual(headlineFigures.map((figure) => figure.value));
}

test.describe('one story', () => {
  test('one heading, every drawn study a step, each with its one way in', async ({ page }) => {
    await page.goto('/');
    const story = section(page);

    await expect(story.getByRole('heading', { level: 2 })).toHaveText(workStory.title);
    await expect(story.getByRole('heading', { level: 3 })).toHaveCount(STORY.length);
    await expect(page.locator('#try-it')).toHaveCount(0);
    await expect(story.getByRole('link', { name: `All ${caseStudies.length}` })).toHaveAttribute('href', '/work');

    for (const study of STORY) {
      const link = story.getByRole('link', { name: ctaName(study), exact: true });
      await expect(link).toHaveAttribute('href', storyAction(study).href);
    }
  });

  test('every study with an interactive invites the reader to try it, at the part it is drawn in', async ({ page }) => {
    await page.goto('/');
    const withInteractive = caseStudies.filter((study) => study.interactive !== undefined);
    expect(withInteractive.every((study) => STORY.includes(study))).toBe(true);

    for (const study of withInteractive) {
      if (!study.interactive) continue;
      const link = section(page).getByRole('link', {
        name: `${tryIt.prefix} — ${tryIt.action[study.interactive]}`,
      });
      await expect(link).toHaveAttribute('href', `/work/${study.slug}#what-it-actually-was`);
    }
  });

  test('a try-it lands on its interactive', async ({ page }) => {
    const first = STORY.find((study) => study.interactive !== undefined);
    test.skip(first === undefined, 'no case study carries an interactive');
    if (first === undefined) return;

    await page.goto('/');
    const link = section(page).getByRole('link', { name: ctaName(first), exact: true });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/work/${first.slug}#what-it-actually-was$`));
    await expect(page.getByRole('heading', { name: 'What it actually was' })).toBeInViewport();
  });
});

test.describe('pinned story, wide and tall screens', () => {
  test.skip(({ isMobile }) => isMobile, 'pinning needs a screen at least 1024px wide');

  test('the drawing pins, and the step and the drawing follow the scroll', async ({ page }) => {
    await page.goto('/');
    await expect(stage(page)).toBeVisible();

    const visual = stage(page).locator('.scrolly-visual');
    await expect(visual).toBeVisible();
    expect(await visual.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

    const seen: number[] = [];
    for (let target = 1; target < STORY.length; target += 1) {
      await scrollUntilStep(page, target);
      await expect.poll(() => activeStep(page)).toBe(target);
      seen.push(await activeStep(page));
      await expect(stage(page).locator(`[data-step="${target}"]`)).toHaveAttribute('aria-current', 'step');
      await expect.poll(() => drawnState(stage(page).locator(`[data-frame="${target}"]`))).toBe('1');
      expect(await drawnState(stage(page).locator(`[data-frame="${target - 1}"]`))).toBe('0');
    }
    expect(seen).toEqual(STORY.map((_, index) => index).slice(1));
  });
});

test.describe('cards in flow, on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('nothing pins, and each drawing draws itself in as its card is reached', async ({ page }) => {
    await page.goto('/');

    await expect(stage(page).locator('.scrolly-visual')).toBeHidden();
    const last = STORY.length - 1;
    const lastArt = stage(page).locator(`[data-step="${last}"] .work-story-card-art`);
    await expect(lastArt).toBeVisible();
    expect(await drawnState(lastArt)).toBe('0');

    await scrollUntilStep(page, last);
    await expect.poll(() => drawnState(lastArt)).toBe('1');
    expect(await drawnState(stage(page).locator('[data-step="0"] .work-story-card-art'))).toBe('1');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the finished story: nothing sticky, every drawing drawn, every report on the page', async ({ page }) => {
    await page.goto('/');
    await scrollToMidStory(page);

    await expect(stage(page).locator('.scrolly-visual')).toBeHidden();

    for (const [index, study] of STORY.entries()) {
      await expect(section(page).getByText(study.reported).filter({ visible: true }).first()).toBeVisible();
      const art = stage(page).locator(`[data-step="${index}"] .work-story-card-art`);
      await expect(art).toBeVisible();
      expect(await drawnState(art)).toBe('1');
    }
  });
});

test.describe('offer figures', () => {
  test('read their published values as the page loads', async ({ page }) => {
    await page.goto('/');
    await expectPublishedFigures(page);
  });

  test('read their published values mid-scroll', async ({ page }) => {
    await page.goto('/');
    const offer = page.getByRole('region', { name: 'Evidence and contact' });
    await offer.scrollIntoViewIfNeeded();
    await scrollByHand(page, 120);
    await expectPublishedFigures(page);
  });

  test('a row scrolled fully into view, past the opening scene, reads its published values', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const row = page.getByRole('region', { name: 'Evidence and contact' }).locator('dl');
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeInViewport({ ratio: 1 });
    await expectPublishedFigures(page);
  });
});

test.describe('every viewport', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways scroll, the name is clear of the header, each study linked once`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const [h1, header] = await Promise.all([
        page.locator('h1').boundingBox(),
        page.locator('header').first().boundingBox(),
      ]);
      expect(h1).not.toBeNull();
      expect(header).not.toBeNull();
      expect(h1!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      expect(h1!.y + h1!.height).toBeLessThanOrEqual(viewport.height);

      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(await overflow()).toBeLessThanOrEqual(0);

      await scrollToMidStory(page);
      expect(await overflow()).toBeLessThanOrEqual(0);

      const tree = await page.locator('main').ariaSnapshot();
      for (const study of STORY) {
        const href = storyAction(study).href;
        const links = tree.split('\n').filter((line) => line.trim() === `- /url: ${href}`);
        expect(links, `${href} should be one link in the accessibility tree`).toHaveLength(1);
      }
    });
  }
});

test.describe('axe, mid-story', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: no serious or critical violations with the story part-way through`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/');
      await scrollToMidStory(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
    });
  }
});
