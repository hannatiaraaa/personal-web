import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { stackGroups } from '../src/content/stack';
import { listStackItems } from '../src/modules/stack/lib/stack-items';
import { scrollByHand } from './support/input';
import { shouldPin } from './support/approved-modes';
import { findSceneLabelOverlaps } from './support/geometry';

/**
 * The stack page: the skills library, each group with a scene that explains
 * it. What a reader can observe — every group and item there as text, once;
 * one scene announced at a time, the active group's, following the scroll in
 * every engine; and every group's finished scene in its card for a reader
 * without motion or scripts.
 */

const SCENE = '.stack-story';
const LAST_BEAT = String(stackGroups.length - 1);
const WHEEL_STEP = 140;
const MAX_WHEELS = 120;

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Matches the whole of a text, so `Bun` is not found inside `Bun workspaces`. */
function exactly(text: string): RegExp {
  return new RegExp(`^${escape(text)}$`);
}

async function beat(page: Page): Promise<string | null> {
  return page.locator(SCENE).getAttribute('data-beat');
}

function isPinned(page: Page): boolean {
  return shouldPin(page);
}

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/** Jumps to a point of the scene, as share of its pinned travel. */
async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate((share) => {
    const scene = document.querySelector('.stack-story');
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    window.scrollTo({ top: top + share * (rect.height - window.innerHeight), behavior: 'instant' });
  }, progress);
}

/** Brings a group's step to the middle of the screen: past the reading line, well short of the next. */
async function scrollToGroup(page: Page, index: number) {
  await page.evaluate((position) => {
    const step = document.querySelectorAll('.stack-story-step')[position];
    if (!step) return;
    const top = step.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - window.innerHeight * 0.5, behavior: 'instant' });
  }, index);
}

/** The scenes a reader can perceive in the pinned panel: their accessible names. */
async function panelScenes(page: Page): Promise<string[]> {
  const scenes = page.locator('.stack-story-visual').getByRole('img');
  return scenes.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label') ?? ''));
}

/** Pieces of the panel's shown scene still drawing in: scaled other than whole. */
async function undrawnPieces(page: Page): Promise<number> {
  return page.locator('.stack-story-scene .stack-scene-in').evaluateAll(
    (nodes) =>
      nodes.filter((node) => {
        if (getComputedStyle(node).visibility !== 'visible') return false;
        const transform = getComputedStyle(node).transform;
        return new DOMMatrix(transform === 'none' ? undefined : transform).a !== 1;
      }).length,
  );
}

/** Each group's card carries its scene: one image, named by a sentence. */
async function expectSceneInEveryCard(page: Page) {
  for (const group of stackGroups) {
    const scene = page.getByRole('region', { name: group.title, exact: true }).getByRole('img');
    await expect(scene, group.title).toHaveCount(1);
    await expect(scene, group.title).toHaveAccessibleName(/\w+ \w+ \w+ \w+/);
  }
}

/**
 * Nothing pinned, every card with its scene, and every chip at rest in place.
 * In flow with motion, where scroll timelines exist, a chip not yet scrolled to
 * waits for its entrance, so there the chips are not checked.
 */
async function expectFinished(page: Page) {
  await expect(page.locator('.stack-story-visual')).toBeHidden();
  await expectSceneInEveryCard(page);
  const settles =
    isPinned(page) || (await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  if (!settles) return;

  const displaced = await page.locator(`${SCENE} .stack-story-chip`).evaluateAll(
    (nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        const matrix = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
        return Number(style.opacity) < 1 || Math.abs(matrix.m42) > 0.5 || Math.abs(matrix.a - 1) > 0.01;
      }).length,
  );
  expect(displaced).toBe(0);
}

test.describe('the library', () => {
  test('every group heading and every item is on the page, each item exactly once', async ({ page }) => {
    await page.goto('/stack');

    for (const group of stackGroups) {
      const heading = page.getByRole('heading', { level: 2, name: group.title, exact: true });
      await expect(heading).toHaveCount(1);
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();

      const section = page.getByRole('region', { name: group.title, exact: true });
      for (const item of listStackItems(group)) {
        const chip = section.getByRole('listitem').filter({ hasText: exactly(item) });
        await expect(chip, item).toHaveCount(1);
        await chip.scrollIntoViewIfNeeded();
        await expect(chip, item).toBeVisible();
      }
    }

    const counts = await page.evaluate(
      (items) =>
        items.map((item) => [...document.querySelectorAll('li')].filter((li) => li.textContent === item).length),
      stackGroups.flatMap(listStackItems),
    );
    expect(counts.every((count) => count === 1)).toBe(true);
  });

  test('a group in subgroups labels each one and lists its items under it', async ({ page }) => {
    await page.goto('/stack');

    for (const group of stackGroups) {
      const section = page.getByRole('region', { name: group.title, exact: true });
      for (const subgroup of group.subgroups ?? []) {
        const heading = section.getByRole('heading', { level: 3, name: subgroup.title, exact: true });
        await expect(heading).toHaveCount(1);
        const list = heading.locator('xpath=following-sibling::ul[1]');
        await expect(list.getByRole('listitem')).toHaveText(subgroup.items.map((item) => exactly(item)));
      }
    }
  });

  test('Delivery follows the stack, unchanged', async ({ page }) => {
    await page.goto('/stack');

    await expect(page.getByRole('heading', { level: 2, name: 'How it gets delivered' })).toBeAttached();
    const order = await page.evaluate(() => {
      const scene = document.querySelector('.stack-story');
      const delivery = document.getElementById('process');
      return scene && delivery ? scene.compareDocumentPosition(delivery) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    });
    expect(order).toBeTruthy();
  });
});

test.describe('as the reader scrolls, pinned', () => {
  test.skip(({ isMobile }) => isMobile, 'below the pin size the groups are cards in flow; nothing follows the scroll');

  test('the panel announces one scene at a time, the group on screen, and draws it in full', async ({ page }) => {
    await page.goto('/stack');
    expect(isPinned(page)).toBe(true);

    const seen = new Set<string>();
    for (const [index, group] of stackGroups.entries()) {
      await scrollToGroup(page, index);
      await expect.poll(() => beat(page), group.title).toBe(String(index));

      await expect.poll(async () => (await panelScenes(page)).length, group.title).toBe(1);
      const [name = ''] = await panelScenes(page);
      expect(name, group.title).toMatch(/\w+ \w+ \w+ \w+/);
      seen.add(name);
      await expect.poll(() => undrawnPieces(page), `${group.title} drawn`).toBe(0);
      await expect(page.getByRole('region', { name: group.title, exact: true }).getByRole('img')).toHaveCount(0);
    }

    expect(seen.size).toBe(stackGroups.length);
  });

  test('scrolled by hand, the groups take the panel in order and the last one holds', async ({ page }) => {
    await page.goto('/stack');
    await expect.poll(() => beat(page)).toBe('0');

    const seen = ['0'];
    for (let wheel = 0; wheel < MAX_WHEELS && seen.at(-1) !== LAST_BEAT; wheel += 1) {
      await scrollByHand(page, WHEEL_STEP);
      await page.waitForTimeout(40);
      const current = (await beat(page)) ?? '';
      if (current !== seen.at(-1)) seen.push(current);
    }

    expect(seen).toEqual(Array.from({ length: stackGroups.length }, (_, index) => String(index)));
    await expect.poll(async () => (await panelScenes(page)).length).toBe(1);
  });
});

test.describe('every viewport', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: nothing sideways, and a pinned panel stays on screen`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/stack');
      const pinned = isPinned(page);
      const header = await page.locator('header').first().boundingBox();

      for (const share of [0, 0.5, 1]) {
        await scrollToProgress(page, share);
        await page.waitForTimeout(100);
        expect(await overflow(page)).toBeLessThanOrEqual(0);

        if (pinned) {
          const visual = await page.locator('.stack-story-visual').boundingBox();
          expect(visual).not.toBeNull();
          expect(visual!.y).toBeGreaterThanOrEqual(header!.height);
          expect(visual!.y + visual!.height).toBeLessThanOrEqual(viewport.height);
        }
      }
    });
  }
});

test.describe('every scene', () => {
  test('no label runs into another label or into a box it does not sit in', async ({ page }) => {
    await page.goto('/stack');
    await expect(page.locator('.stack-scene').first()).toBeAttached();
    expect(await findSceneLabelOverlaps(page, '.stack-scene')).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every card shows its finished scene at once, every chip in place, nothing pinned', async ({ page }) => {
    await page.goto('/stack');

    await expectFinished(page);
    for (const item of stackGroups.flatMap(listStackItems)) {
      await expect(page.getByRole('listitem').filter({ hasText: exactly(item) })).toBeAttached();
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every card carries its scene, readable in flow', async ({ page }) => {
    await page.goto('/stack');

    await expectFinished(page);
    const last = stackGroups.at(-1);
    await expect(page.getByRole('heading', { level: 2, name: last?.title ?? '' })).toBeVisible();
  });
});

for (const theme of ['light', 'dark'] as const) {
  test(`mid-scene, ${theme}: no serious or critical axe violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/stack');
    await scrollToGroup(page, 2);
    // Let the landing chips and the scene's draw-in finish.
    await page.waitForTimeout(1200);

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
