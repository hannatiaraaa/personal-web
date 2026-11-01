import { expect, test, type Page } from '@playwright/test';
import { SITE_ROUTES } from '../src/common/lib/site-routes';
import { findSmallTapTargets } from './support/geometry';
import { nextFocusKey } from './support/input';

const PHONE = { width: 375, height: 667 };

function menuButton(page: Page) {
  return page.getByRole('banner').getByRole('button', { name: 'Menu' });
}

function menuPanel(page: Page) {
  return page.locator('.mobile-menu');
}

test.describe('on a phone', () => {
  test.use({ viewport: PHONE });

  test('the links fold behind a menu button that says whether it is open', async ({ page }) => {
    await page.goto('/work');
    const button = menuButton(page);

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);

    await button.click();

    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = page.locator(`#${await button.getAttribute('aria-controls')}`);
    await expect(panel).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveText(SITE_ROUTES.map((route) => route.label));
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    await expect(panel.getByRole('button', { name: /switch (to (light|dark) )?theme/i })).toBeVisible();
  });

  test('the button and every control in the open menu are at least 44px', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();

    expect(await findSmallTapTargets(page, '.menu-btn, .mobile-menu')).toEqual([]);
  });

  test('Escape closes it and puts focus back on the button', async ({ page }) => {
    await page.goto('/');
    const button = menuButton(page);
    await button.click();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Stack' }).focus();

    await page.keyboard.press('Escape');

    await expect(menuPanel(page)).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('a press outside closes it', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(menuPanel(page)).toBeVisible();

    await page.mouse.click(PHONE.width / 2, PHONE.height - 40);

    await expect(menuPanel(page)).toBeHidden();
  });

  test('following a link closes it on the next page', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Stack' }).click();

    await expect(page).toHaveURL(/\/stack$/);
    await expect(menuPanel(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus moves from the button into the links, in reading order', async ({ page }) => {
    await page.goto('/');
    const button = menuButton(page);
    // Opened from the keyboard: Safari does not focus a button on click.
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press(nextFocusKey(page));

    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' })).toBeFocused();
  });

  test('opening it moves nothing on the page', async ({ page }) => {
    await page.goto('/work');
    const heading = page.getByRole('heading', { level: 1 });
    const before = await heading.boundingBox();

    await menuButton(page).click();

    expect(await heading.boundingBox()).toEqual(before);
  });
});

test.describe('on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the links sit in the bar and there is no menu button', async ({ page }) => {
    await page.goto('/');

    await expect(menuButton(page)).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveText(
      SITE_ROUTES.map((route) => route.label),
    );
  });
});
