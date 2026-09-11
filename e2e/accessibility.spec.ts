import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { caseStudies } from '../src/content/case-studies';

const ROUTES = ['/', '/work', '/stack', '/about', '/cv', `/work/${caseStudies[0]?.slug ?? ''}`];

/**
 * axe cannot certify that a tab order makes sense, so the manual keyboard pass
 * stays in the run log. What it can certify is asserted here, on both themes —
 * a token pair that fails contrast in dark mode only is the realistic failure.
 */
for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    for (const route of ROUTES) {
      test(`${route} has no serious or critical violations`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

        const blocking = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        );

        expect(
          blocking,
          blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n'),
        ).toEqual([]);
      });
    }
  });
}

test.describe('keyboard access', () => {
  test('the skip link is the first stop and it reaches main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe('#main');
  });

  test('every interactive element has a discernible name', async ({ page }) => {
    await page.goto('/');

    for (const element of await page.locator('a, button').all()) {
      const name = (await element.getAttribute('aria-label')) ?? (await element.innerText());
      expect(name.trim().length, 'an interactive element rendered with no accessible name').toBeGreaterThan(0);
    }
  });

  test('the theme toggle announces what it will do, and does it', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to (light|dark) theme/i });
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  });

  test('the current page is marked for assistive tech, not only by colour', async ({ page }) => {
    await page.goto('/work');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test.describe('one heading order per page', () => {
  for (const route of ROUTES) {
    test(`${route} has exactly one h1`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }
});
