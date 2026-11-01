import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * The tax-ladder playground on the "one arithmetic ladder" case study: the
 * same requisition totalled with tax at every level and with one ladder, and
 * two rates the reader can move. Asserted as a visitor sees it — the totals as
 * printed, the gap as printed, what a keyboard does, what reduced motion shows.
 */

const PATH = '/work/one-arithmetic-ladder';

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

const DEFAULT_TAX = 11;
const DEFAULT_DISCOUNT = 5;

function scene(page: Page): Locator {
  return page.locator('.tax-ladder-scene');
}

function total(page: Page, column: 'before' | 'after'): Locator {
  return page.locator(`[data-tax-ladder-total="${column}"] .tax-ladder-amount`);
}

function gap(page: Page): Locator {
  return page.locator('[data-tax-ladder-gap]');
}

/** The two receipts, as the regions their headings name. */
function receipts(page: Page): Locator {
  return page.getByRole('region', { name: /^(Before|After) — / });
}

/**
 * How far each receipt row's content sits from its resting place — what a
 * reader sees as a row still sliding in from behind its edge.
 */
function rowOffsets(page: Page): Promise<number[][]> {
  return receipts(page).evaluateAll((sections) =>
    sections.map((section) =>
      [...section.querySelectorAll('li')].map((row) => {
        const content = row.firstElementChild;
        if (!content) return -1;
        return Math.round(row.getBoundingClientRect().left - content.getBoundingClientRect().left);
      }),
    ),
  );
}

function slider(page: Page, name: 'Tax rate' | 'Discount'): Locator {
  return page.getByRole('slider', { name });
}

/** Brings the playground on screen and waits until its controls are live. */
async function openPlayground(page: Page): Promise<void> {
  await page.goto(PATH);
  await scene(page).scrollIntoViewIfNeeded();
  await expect(slider(page, 'Tax rate')).toBeEnabled();
}

/** Moves a slider to `to` with the arrow keys, from `from`, the way a keyboard reader does. */
async function moveSlider(page: Page, name: 'Tax rate' | 'Discount', from: number, to: number): Promise<void> {
  const control = slider(page, name);
  await control.focus();
  const key = to > from ? 'ArrowRight' : 'ArrowLeft';
  for (let step = 0; step < Math.abs(to - from); step += 1) await control.press(key);
  await expect(control).toHaveValue(String(to));
}

test.describe('the arithmetic', () => {
  test('opens with tax at every level over the one-ladder total', async ({ page }) => {
    await openPlayground(page);

    await expect(total(page, 'before')).toHaveText('855.24');
    await expect(total(page, 'after')).toHaveText('824.93');
    await expect(gap(page)).toContainText('+3.7%');
    await expect(page.getByText('Illustrative numbers')).toBeVisible();
  });

  test('changing the tax rate changes both totals and the gap', async ({ page }) => {
    await openPlayground(page);

    await moveSlider(page, 'Tax rate', DEFAULT_TAX, 20);

    await expect(total(page, 'before')).not.toHaveText('855.24');
    await expect(total(page, 'after')).not.toHaveText('824.93');
    await expect(gap(page)).not.toContainText('+3.7%');
    await expect(gap(page)).toContainText(/^\+\d+\.\d%/);
  });

  test('the one ladder matches the hand-worked maths for a known input', async ({ page }) => {
    await openPlayground(page);

    await moveSlider(page, 'Tax rate', DEFAULT_TAX, 20);
    await moveSlider(page, 'Discount', DEFAULT_DISCOUNT, 10);

    // 782.30 − 10% (78.23) = 704.07; + 20% (140.81) = 844.88.
    await expect(total(page, 'after')).toHaveText('844.88');
  });

  test('with tax above zero the layered total is over; at zero the gap closes', async ({ page }) => {
    await openPlayground(page);
    const amount = async (column: 'before' | 'after') =>
      Number((await total(page, column).innerText()).replace(/,/g, ''));

    expect(await amount('before')).toBeGreaterThan(await amount('after'));

    await slider(page, 'Tax rate').focus();
    await page.keyboard.press('Home');
    await expect(slider(page, 'Tax rate')).toHaveValue('0');

    await expect(total(page, 'before')).toHaveText(await total(page, 'after').innerText());
    await expect(gap(page)).toHaveText('0.0%');
  });

  test('reset returns both rates and the opening totals', async ({ page }) => {
    await openPlayground(page);
    await moveSlider(page, 'Tax rate', DEFAULT_TAX, 15);

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(slider(page, 'Tax rate')).toHaveValue(String(DEFAULT_TAX));
    await expect(total(page, 'before')).toHaveText('855.24');
  });
});

test.describe('assistive tech', () => {
  test('the sliders are labelled and answer the arrow keys', async ({ page }) => {
    await openPlayground(page);
    const tax = slider(page, 'Tax rate');

    await tax.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tax).toHaveValue(String(DEFAULT_TAX + 1));
    await expect(tax).toHaveAttribute('aria-valuetext', `${DEFAULT_TAX + 1}%`);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(tax).toHaveValue(String(DEFAULT_TAX - 1));
  });

  test('a change is announced politely once it settles, and nothing before', async ({ page }) => {
    await openPlayground(page);
    const live = page.locator('.tax-ladder-board [aria-live="polite"]');

    await expect(live).toHaveText('');
    await moveSlider(page, 'Tax rate', DEFAULT_TAX, 0);

    await expect(live).toHaveText(/Tax at every level: [\d,.]+\. One ladder: [\d,.]+\. The totals agree\./);
  });
});

test.describe('scroll choreography', () => {
  test('where it pins, the broken receipt prints as the scene scrolls, then the ladder', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the scene pins only on a screen at least 1024px wide');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PATH);

    const at = async (progress: number) => {
      await page.evaluate((p) => {
        const element = document.querySelector('.tax-ladder-scene');
        if (!element) return;
        const { top, height } = element.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + top + (height - window.innerHeight) * p, behavior: 'instant' });
      }, progress);
      // --progress already holds a value from load; wait for the one this scroll set,
      // or a slow frame under load lets the assertions read the previous state.
      await expect
        .poll(async () =>
          Number(
            await scene(page).evaluate((element) =>
              element instanceof HTMLElement ? element.style.getPropertyValue('--progress') : 'NaN',
            ),
          ),
        )
        .toBeCloseTo(progress, 1);
    };
    // How far each receipt's last row sits from its resting place.
    const offsets = async () => (await rowOffsets(page)).map((rows) => rows.at(-1) ?? -1);

    await at(0.3);
    await expect.poll(async () => (await offsets()).every((offset) => offset > 0)).toBe(true);

    await at(1);
    await expect.poll(offsets).toEqual([0, 0]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the board is whole before it is reached, and the controls still work', async ({ page }) => {
    await page.goto(PATH);

    const displaced = (await rowOffsets(page)).flat().filter((offset) => offset !== 0);
    expect(displaced, 'a receipt row is still sliding in').toHaveLength(0);

    // Polled: the live board may replace the placeholder mid-read, and a detached node has no computed style.
    const stampScales = () =>
      receipts(page)
        .getByText(/^Tax( on tax)?$/)
        .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).scale));
    await expect.poll(async () => (await stampScales()).length).toBeGreaterThan(0);
    await expect.poll(async () => (await stampScales()).every((scale) => scale === '1' || scale === 'none')).toBe(true);

    await scene(page).scrollIntoViewIfNeeded();
    await expect(slider(page, 'Tax rate')).toBeEnabled();
    await moveSlider(page, 'Tax rate', DEFAULT_TAX, 0);
    await expect(gap(page)).toHaveText('0.0%');
  });

  test('nothing pins, so there is no scroll to travel through', async ({ page }) => {
    await page.goto(PATH);

    const heights = await scene(page).evaluate((element) => ({
      scene: element.getBoundingClientRect().height,
      board: element.querySelector('.tax-ladder-board')?.getBoundingClientRect().height ?? 0,
    }));
    expect(heights.scene).toBeLessThanOrEqual(heights.board + 1);
  });
});

test.describe('every width and height', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways scroll, and the board fits its column`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openPlayground(page);

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const board = await page.locator('.tax-ladder-board').boundingBox();
      expect(board).not.toBeNull();
      expect((board?.x ?? 0) + (board?.width ?? 0)).toBeLessThanOrEqual(viewport.width);

      // The figures never wrap into the label beside them.
      const clipped = await page
        .locator('.tax-ladder-amount')
        .evaluateAll((amounts) =>
          amounts.filter((amount) => amount instanceof HTMLElement && amount.scrollWidth > amount.offsetWidth + 1),
        );
      expect(clipped).toHaveLength(0);
    });
  }
});

test.describe('axe', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: the live playground has no serious or critical violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await openPlayground(page);
      await page.locator('.tax-ladder-console').scrollIntoViewIfNeeded();
      await moveSlider(page, 'Tax rate', DEFAULT_TAX, 12);

      const results = await new AxeBuilder({ page })
        .include('.tax-ladder-scene')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
    });
  }
});
