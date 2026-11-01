import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { arc, layers } from '../src/content/arc';
import { layerCountSpans, layersOwnedAt, newLayersAt } from '../src/modules/about/lib/layers-owned';
import { nextFrame, scrollByHand, settleScroll } from './support/input';
import { shouldPin } from './support/approved-modes';

const ARC = 'The arc, one era at a time';
const WALK = 'The contagion model, step by step';
/** A tall step's top is brought just above the reading band (40–55%)… */
const STEP_TOP_AT = 0.3;
/** …and a short one is centred in it, so its neighbour cannot claim more. */
const BAND_CENTRE_AT = 0.475;
const MAX_WHEELS = 80;
const WHEEL_LIMIT = 300;
const SETTLED_PX = 30;
const LAYER_IDS = layers.map((layer) => layer.id);
/**
 * A walk through all twelve eras wheels each one into the band, and every era
 * that becomes current slides the panel. WebKit on Linux paints that in
 * software at twice the pixel ratio, so the walk outlasts the default timeout
 * on a CI runner; the other engines finish well inside it.
 */
const SLOW_WALK = 'a twelve-era walk, painted in software by WebKit on Linux';
/** The smallest screen the panel is approved to pin on (support/approved-modes.ts). */
const PINS = { width: 1024, height: 640 };

/** Whether the stories are approved to pin on this page's screen, so a step follows the scroll. */
function pins(page: Page): boolean {
  return shouldPin(page);
}

/**
 * Scrolls with the wheel, as a reader does, until the step covers the
 * reading band. The wheel matters: a focused step holds the story
 * until the reader scrolls by hand, and a programmatic scroll is not that.
 */
async function wheelStepIntoBand(page: Page, step: Locator) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('no viewport');
  await page.mouse.move(viewport.width / 2, viewport.height / 2);

  let isAtRest = false;
  for (let i = 0; i < MAX_WHEELS; i += 1) {
    const box = await step.boundingBox();
    if (!box) throw new Error('step is not rendered');
    const targetTop = Math.max(viewport.height * STEP_TOP_AT, viewport.height * BAND_CENTRE_AT - box.height / 2);
    const delta = box.y - targetTop;
    if (Math.abs(delta) < SETTLED_PX) {
      // Close enough mid-scroll is not close enough at rest: check again once it stops.
      if (isAtRest) return;
      await settleScroll(page);
      isAtRest = true;
      continue;
    }
    isAtRest = false;
    // A screen or more away, one long wheel brings it within a screen; the last screen goes in short wheels.
    const limit = Math.max(WHEEL_LIMIT, Math.abs(delta) - viewport.height);
    await scrollByHand(page, Math.max(-limit, Math.min(limit, delta)));
    await nextFrame(page);
  }
}

function stage(page: Page, name: string) {
  return page.getByRole('group', { name, exact: true });
}

function stepsOf(stageLocator: Locator) {
  return stageLocator.locator('[data-step]');
}

test.describe('the arc as a scroll story', () => {
  test.skip(({ page }) => !pins(page), 'a step follows the scroll only where the story pins');

  test('the active step follows the reader down the arc and back', async ({ page, browserName }) => {
    test.slow(browserName === 'webkit', SLOW_WALK);
    await page.goto('/about');
    const steps = stepsOf(stage(page, ARC));
    await expect(steps).toHaveCount(arc.length);

    for (let index = 0; index < arc.length; index += 1) {
      await wheelStepIntoBand(page, steps.nth(index));
      await expect(steps.nth(index)).toHaveAttribute('aria-current', 'step');
      await expect(stage(page, ARC).locator('[aria-current="step"]')).toHaveCount(1);
    }

    await wheelStepIntoBand(page, steps.nth(1));
    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  });

  test('an era card that adds a layer states the count and the new layer; one that adds none repeats nothing', async ({
    page,
  }) => {
    await page.goto('/about');
    const steps = stepsOf(stage(page, ARC));

    for (const index of arc.keys()) {
      const owned = layersOwnedAt(LAYER_IDS, arc, index);
      const added = layers.filter((layer) => newLayersAt(LAYER_IDS, arc, index).includes(layer.id));
      const card = steps.nth(index);
      const status = card.locator('.arc-era-layer-status');
      // The count is in the card's text either way, for a screen reader meeting it alone.
      await expect(card).toContainText(`${owned.length} of ${layers.length} layers owned`);
      if (added.length > 0) {
        await expect(status).toHaveText(
          `${owned.length} of ${layers.length} layers owned · new: ${added.map((layer) => layer.label).join(', ')}`,
        );
      } else {
        await expect(status).toHaveCount(0);
      }
    }
  });

  test('no two consecutive era cards show the same status line', async ({ page }) => {
    await page.goto('/about');

    const lines = await stepsOf(stage(page, ARC)).evaluateAll((cards) =>
      cards.map((card) => {
        const status = card.querySelector('.arc-era-layer-status');
        return status?.checkVisibility() ? (status.textContent ?? '') : '';
      }),
    );

    const repeats = lines.filter((line, index) => line !== '' && line === lines[index - 1]);
    expect(repeats).toEqual([]);
  });

  test('the panel holds one number per count, so it moves only when the count changes', async ({ page }) => {
    await page.goto('/about');

    const values = await page.locator('.arc-layers-count-value').allTextContents();

    expect(values).toEqual(layerCountSpans(LAYER_IDS, arc).map((span) => String(span.count)));
    expect(new Set(values).size).toBe(values.length);
  });

  test('pinned, the panel shows the era being read and fills the layers owned so far', async ({
    page,
    browserName,
  }) => {
    test.slow(browserName === 'webkit', SLOW_WALK);
    const viewport = page.viewportSize();
    test.skip(!viewport || viewport.width < PINS.width, 'the panel only shows where the stage pins');
    await page.goto('/about');
    const arcStage = stage(page, ARC);
    const steps = stepsOf(arcStage);
    const fills = arcStage.locator('.arc-layer-fill');
    const tags = arcStage.locator('.arc-layer-new');
    await expect(fills).toHaveCount(layers.length);

    for (const [index, era] of arc.entries()) {
      await wheelStepIntoBand(page, steps.nth(index));
      await expect(steps.nth(index)).toHaveAttribute('aria-current', 'step');

      // The era's scene has slid into the panel: no transform left on it.
      // A missing `--active-step` line in scrolly-about.css fails here.
      const scene = arcStage.locator(`.arc-scene[data-era='${index}']`);
      await expect
        .poll(() => scene.evaluate((node) => getComputedStyle(node).transform))
        .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

      // Each layer's fill is fully drawn once owned and empty before.
      const owned = new Set(layersOwnedAt(LAYER_IDS, arc, index));
      const expected = LAYER_IDS.map((id) => (owned.has(id) ? 1 : 0));
      await expect
        .poll(() =>
          fills.evaluateAll((nodes) => nodes.map((node) => new DOMMatrix(getComputedStyle(node).transform).a)),
        )
        .toEqual(expected);

      // Only the layers this era added wear the "new" tag.
      const isNew = LAYER_IDS.map((id) => (era.adds.includes(id) ? 1 : 0));
      await expect
        .poll(() => tags.evaluateAll((nodes) => nodes.map((node) => new DOMMatrix(getComputedStyle(node).transform).a)))
        .toEqual(isNew);
    }
  });

  test('tabbing into an era makes it the active step', async ({ page }) => {
    await page.goto('/about');
    const steps = stepsOf(stage(page, ARC));

    await steps.nth(0).getByRole('article').focus();
    await expect(steps.nth(0)).toHaveAttribute('aria-current', 'step');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(steps.nth(2).getByRole('article')).toBeFocused();
    await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
  });
});

test.describe('the contagion walk', () => {
  test('pinned, it steers beta as the steps pass, until the visitor moves the slider', async ({ page }) => {
    await page.setViewportSize(PINS);
    await page.goto('/about');
    const steps = stepsOf(stage(page, WALK));
    const slider = page.getByRole('slider', { name: 'Transmission probability per contact' });

    await wheelStepIntoBand(page, steps.nth(1));
    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
    await expect(slider).toHaveValue('0.08');

    await slider.fill('0.05');
    await wheelStepIntoBand(page, steps.nth(2));
    await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
    await expect(slider).toHaveValue('0.05');
  });
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
] as const) {
  test(`${viewport.width}×${viewport.height}: below pin the model stands alone, unsteered, and its controls work`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/about');
    const walk = stage(page, WALK);
    const slider = page.getByRole('slider', { name: 'Transmission probability per contact' });
    const initial = await slider.inputValue();

    await expect(walk.locator('.walk-step').first()).toBeHidden();
    await expect(walk.getByRole('heading', { name: 'At low beta' })).toHaveCount(0);
    await expect(page.getByText('The model follows these three steps')).toBeHidden();

    // Scrolling the model through the screen leaves it where it was.
    await walk.scrollIntoViewIfNeeded();
    await scrollByHand(page, viewport.height);
    await page.waitForTimeout(300);
    await expect(slider).toHaveValue(initial);

    await slider.fill('0.05');
    await expect(slider).toHaveValue('0.05');
    const pause = walk.getByRole('button', { name: /pause/i });
    await pause.click();
    await expect(walk.getByRole('button', { name: /play|resume/i })).toBeVisible();
    await expect(walk.getByRole('button', { name: /reset/i })).toBeVisible();
  });
}

test.describe('era cards on a phone', () => {
  for (const width of [375, 390, 414, 428] as const) {
    test(`${width}px: every era card and its text sit inside the screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/about');

      const outside = await stepsOf(stage(page, ARC)).evaluateAll((cards) => {
        const viewport = document.documentElement.clientWidth;
        return cards.flatMap((card) => {
          const box = card.getBoundingClientRect();
          const texts = [card, ...card.querySelectorAll('p, h3, span')].filter((element) => element.checkVisibility());
          return texts
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && (rect.left < -1 || rect.right > viewport + 1 || rect.right > box.right + 1);
            })
            .map((element) => (element.textContent ?? '').trim().slice(0, 40));
        });
      });

      expect(outside).toEqual([]);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing pins, and every era is shown with its scene', async ({ page }) => {
    await page.goto('/about');

    const positions = await page
      .locator('.scrolly-visual')
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).position));
    expect(positions.length).toBeGreaterThan(0);
    expect(positions).not.toContain('sticky');

    const arcStage = stage(page, ARC);
    for (const era of arc) {
      await expect(arcStage.getByRole('heading', { name: era.title })).toBeVisible();
    }
    const scenes = arcStage.getByRole('img');
    await expect(scenes).toHaveCount(arc.length);
    for (const scene of await scenes.all()) await expect(scene).toBeVisible();

    // The spine travels with each card instead: a strip per era, filled to it.
    const strips = arcStage.locator('.arc-era-layer-strip');
    await expect(strips).toHaveCount(arc.length);
    for (const [index, strip] of (await strips.all()).entries()) {
      await expect(strip).toBeVisible();
      await expect(strip.locator('[data-owned]')).toHaveCount(layersOwnedAt(LAYER_IDS, arc, index).length);
    }
  });
});

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

const NARROWEST_CHECKED_WHOLE_PAGE = 360;

type Box = { x: number; y: number; width: number; height: number };

function overlapArea(a: Box, b: Box): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

test.describe('every width and height', () => {
  // The viewport is set per case, so one project is enough.
  test.skip(({ isMobile }) => isMobile, 'viewport matrix runs once, on desktop');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways scroll, and the panel never covers the era being read`, async ({
      page,
      browserName,
    }) => {
      test.slow(browserName === 'webkit', SLOW_WALK);
      await page.setViewportSize(viewport);
      await page.goto('/about');
      const arcStage = stage(page, ARC);

      for (let index = 0; index < arc.length; index += 1) {
        const step = stepsOf(arcStage).nth(index);
        const current = arcStage.locator('[aria-current="step"]');
        // Below the fit the eras are cards in flow, none of them the current
        // one. Nothing follows the scroll there, so no wheel is needed to reach them.
        if (!pins(page)) {
          await step.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
          await expect(current).toHaveCount(0);
          continue;
        }
        await wheelStepIntoBand(page, step);
        await expect(current).toHaveCount(1);

        const text = await current.boundingBox();
        const panel = await arcStage.locator('.scrolly-visual').boundingBox();
        if (text && panel) expect(overlapArea(text, panel), `era ${index} is covered by the panel`).toBe(0);
      }

      const widths = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        stories: [...document.querySelectorAll('[data-active-step]')].map((story) => ({
          right: story.getBoundingClientRect().right,
          overflow: story.scrollWidth - story.clientWidth,
        })),
      }));
      // Both stories stay inside the viewport, down to 320.
      for (const story of widths.stories) {
        expect(story.right).toBeLessThanOrEqual(widths.viewport);
        expect(story.overflow).toBeLessThanOrEqual(0);
      }
      // At 320 the site header's controls overflow by a few pixels on every
      // route, which is the header's to fix, not this story's.
      if (viewport.width >= NARROWEST_CHECKED_WHOLE_PAGE) expect(widths.page).toBeLessThanOrEqual(widths.viewport);
    });
  }
});

for (const theme of ['light', 'dark'] as const) {
  test(`/about mid-arc has no serious or critical violations, ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/about');
    await wheelStepIntoBand(page, stepsOf(stage(page, ARC)).nth(2));
    if (pins(page)) await expect(stepsOf(stage(page, ARC)).nth(2)).toHaveAttribute('aria-current', 'step');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
  });
}
