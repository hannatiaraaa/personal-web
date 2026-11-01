import { expect, test } from '@playwright/test';

/**
 * Under reduced motion each figure draws once, and ResizeObserver's initial
 * resize clears the canvas, so a missing repaint leaves it blank beside a full
 * legend. "In the viewport" cannot catch that; these assert actual paint.
 */
test.use({ reducedMotion: 'reduce' });

test('the contagion figure is drawn, not blank', async ({ page }) => {
  await page.goto('/about');

  const canvas = page.locator('canvas').first();
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toBeVisible();

  // The 2D context can be read back directly, so this is exact.
  const painted = await canvas.evaluate((element) => {
    const node = element as HTMLCanvasElement;
    const context = node.getContext('2d');
    if (!context) return -1;

    const { data } = context.getImageData(0, 0, node.width, node.height);
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! > 8) opaque += 1;
    }
    return opaque;
  });

  expect(painted).toBeGreaterThan(100);
});

test('the contagion figure says it is still, and every state is reported', async ({ page }) => {
  await page.goto('/about');
  await page.locator('canvas').first().scrollIntoViewIfNeeded();

  const figure = page.locator('figure').filter({ hasText: 'susceptible' }).first();
  const body = await figure.innerText();

  for (const state of ['susceptible', 'affected', 'recovering', 'recovered']) {
    expect(body.toLowerCase()).toContain(state);
  }
  expect(body).toContain('Still frame — motion is switched off');
});

test('the hero says it is still, and a click is the only motion offered', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeInViewport();

  // The caption follows the preference once the hero has read it; wait for that, not for the first paint.
  await expect(page.locator('body')).toContainText('still — touch to ripple');
});
