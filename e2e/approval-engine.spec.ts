import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { approvalEngineCopy as copy } from '../src/content/interactives';
import { nextFocusKey } from './support/input';

/**
 * The approval engine on the "configurable approval engine" case study: one
 * requisition routed through two customers' ladders, and the hard-coded engine
 * it replaced one press away. Asserted as a visitor sees it — who signs, what
 * each customer's outcome says, what a keyboard does, what reduced motion and
 * a reader without JavaScript see.
 */

const PATH = '/work/configurable-approval-engine';
const REPORTED = 'Approvals are wrong for this customer.';

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
  { width: 1920, height: 1080 },
] as const;

function engine(page: Page): Locator {
  return page.getByRole('region', { name: copy.label });
}

function customer(page: Page, name: 'A' | 'B'): Locator {
  return engine(page).getByRole('region', { name: new RegExp(`^Customer ${name}`) });
}

function amount(page: Page): Locator {
  return page.getByRole('slider', { name: copy.amountLabel });
}

function policy(page: Page, option: 'hard-coded' | 'configured'): Locator {
  return page.getByRole('button', { name: copy.policy[option] });
}

/** A rung by its role, read as text: who it is and what it says it does for this request. */
function rung(page: Page, who: 'A' | 'B', role: string): Locator {
  return customer(page, who).getByRole('listitem').filter({ hasText: role });
}

/** Brings the engine on screen and waits until its controls are live. */
async function openEngine(page: Page): Promise<void> {
  await page.goto(PATH);
  await engine(page).scrollIntoViewIfNeeded();
  await expect(amount(page)).toBeEnabled();
}

test.describe('routing', () => {
  test('opens on each customer routed by its own ladder, labelled illustrative', async ({ page }) => {
    await openEngine(page);

    await expect(engine(page).getByText('Illustrative numbers')).toBeVisible();
    await expect(policy(page, 'configured')).toHaveAttribute('aria-pressed', 'true');
    await expect(customer(page, 'A')).toContainText('Signed by Superintendent.');
    await expect(customer(page, 'B')).toContainText('Signed by Purchasing, Superintendent and Finance.');
    await expect(customer(page, 'B')).toContainText('Routed by this customer’s own ladder.');
  });

  test('the amount changes the route: under the first limit one tier signs, over the budget owner the guard joins', async ({
    page,
  }) => {
    await openEngine(page);

    await amount(page).focus();
    await page.keyboard.press('Home');
    await expect(customer(page, 'B')).toContainText('Signed by Purchasing and Superintendent.');
    await expect(rung(page, 'B', 'Finance')).toContainText('Not needed');

    await page.keyboard.press('End');
    await expect(customer(page, 'B')).toContainText('Signed by Purchasing, Superintendent, Finance and Director.');
    await expect(rung(page, 'B', 'Director')).toContainText('Signs');
    // The first customer's rule has one approver, whatever the amount.
    await expect(customer(page, 'A')).toContainText('Signed by Superintendent.');
  });

  test('a price check is mandatory only where a customer configured one', async ({ page }) => {
    await openEngine(page);

    await page.getByRole('checkbox', { name: copy.priceCheckLabel }).uncheck();

    await expect(customer(page, 'B')).toContainText('Signed by Superintendent and Finance.');
    await expect(customer(page, 'A')).toContainText('Signed by Superintendent.');
  });
});

test.describe('the policy toggle', () => {
  test('hard-coded, the second customer’s approvals are wrong; configured, they route correctly again', async ({
    page,
  }) => {
    await openEngine(page);

    await policy(page, 'hard-coded').click();
    await expect(policy(page, 'hard-coded')).toHaveAttribute('aria-pressed', 'true');
    await expect(policy(page, 'configured')).toHaveAttribute('aria-pressed', 'false');
    await expect(customer(page, 'B')).toContainText(REPORTED);
    await expect(customer(page, 'B')).toContainText('Never asked: Purchasing and Finance.');
    await expect(rung(page, 'B', 'Purchasing')).toContainText('Never asked');
    await expect(customer(page, 'A')).toContainText('Right for this request.');

    await policy(page, 'configured').click();
    await expect(customer(page, 'B')).not.toContainText(REPORTED);
    await expect(customer(page, 'B')).toContainText('Routed by this customer’s own ladder.');
  });

  test('a super-approver bypass is shown as a bypass, with every step it skipped', async ({ page }) => {
    await openEngine(page);

    await page.getByRole('checkbox', { name: copy.overrideLabel }).check();

    await expect(customer(page, 'B')).toContainText(copy.headline.bypassed);
    await expect(customer(page, 'B')).toContainText('Skipped: Purchasing, Superintendent and Finance.');
    await expect(rung(page, 'B', 'Finance')).toContainText('Bypassed');
    await expect(rung(page, 'B', 'Super-approver')).toContainText('Signs');
  });
});

test.describe('assistive tech', () => {
  test('the controls are labelled and answer the keyboard', async ({ page }) => {
    await openEngine(page);

    // Into the toggle from the control before it, as a keyboard reader arrives.
    await policy(page, 'configured').focus();
    await page.keyboard.press(`Shift+${nextFocusKey(page)}`);
    await expect(policy(page, 'hard-coded')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(policy(page, 'hard-coded')).toHaveAttribute('aria-pressed', 'true');
    await expect(customer(page, 'B')).toContainText(REPORTED);
    await page.keyboard.press(nextFocusKey(page));
    await page.keyboard.press('Space');
    await expect(policy(page, 'configured')).toHaveAttribute('aria-pressed', 'true');

    await amount(page).focus();
    await page.keyboard.press('ArrowRight');
    await expect(amount(page)).toHaveAttribute('aria-valuetext', '12,500');

    const priceCheck = page.getByRole('checkbox', { name: copy.priceCheckLabel });
    await priceCheck.focus();
    await page.keyboard.press('Space');
    await expect(priceCheck).not.toBeChecked();
    await expect(customer(page, 'B')).toContainText('Signed by Superintendent and Finance.');
  });

  test('the outcome is announced politely after a change, and nothing before', async ({ page }) => {
    await openEngine(page);
    const live = engine(page).locator('[aria-live="polite"]');

    await expect(live).toHaveText('');
    await policy(page, 'hard-coded').click();

    await expect(live).toContainText(`Customer B: ${REPORTED}`);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the finished board is there before it is reached, and the controls still work', async ({ page }) => {
    await page.goto(PATH);

    await expect(customer(page, 'B')).toContainText('Signed by Purchasing, Superintendent and Finance.');

    await engine(page).scrollIntoViewIfNeeded();
    await expect(amount(page)).toBeEnabled();
    await policy(page, 'hard-coded').click();
    await expect(customer(page, 'B')).toContainText(REPORTED);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the finished board is drawn, its controls shown but not live', async ({ page }) => {
    await page.goto(PATH);

    await expect(customer(page, 'A')).toContainText('Signed by Superintendent.');
    await expect(customer(page, 'B')).toContainText('Signed by Purchasing, Superintendent and Finance.');
    await expect(amount(page)).toBeDisabled();
  });
});

test.describe('every width and height', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways scroll, and the board fits its column`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openEngine(page);
      await page.getByRole('checkbox', { name: copy.overrideLabel }).check();

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const board = await engine(page).boundingBox();
      expect(board).not.toBeNull();
      expect((board?.x ?? 0) + (board?.width ?? 0)).toBeLessThanOrEqual(viewport.width);

      // No rung's text spills out of its box.
      const spilled = await engine(page)
        .getByRole('listitem')
        .evaluateAll((rungs) => rungs.filter((item) => item.scrollWidth > item.clientWidth + 1).length);
      expect(spilled).toBe(0);
    });
  }
});

test.describe('axe', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: the live engine has no serious or critical violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await openEngine(page);
      // Every rung state on screen at once: signs, not needed, never asked.
      await policy(page, 'hard-coded').click();
      await expect(customer(page, 'B')).toContainText(REPORTED);

      const results = await new AxeBuilder({ page })
        .include('.approval-engine')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([]);
    });
  }
});
