import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { caseStudies } from '../src/content/case-studies';
import { nextFocusKey, scrollByHand } from './support/input';

/**
 * The case study as a scroll story: a part indicator that follows the reader
 * and jumps between the four parts, a reported quote and diagrams that build
 * up on scroll, and evidence figures that count. Asserted as a visitor sees
 * it — which part is marked, where a jump lands, what text the figures read —
 * across every case study.
 */

const PARTS = [
  { short: 'Reported', heading: 'How it was reported' },
  { short: 'Actually', heading: 'What it actually was' },
  { short: 'Shipped', heading: 'What shipped' },
  { short: 'Evidence', heading: 'Evidence' },
] as const;

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

const WHEEL_STEP_PX = 240;
const MAX_WHEEL_STEPS = 60;
const SETTLE_POLL_MS = 120;

const DIAGRAM_STUDIES = caseStudies.filter((study) => study.diagram);

function partNav(page: Page) {
  return page.getByRole('navigation', { name: 'Case study parts' });
}

function partHeading(page: Page, name: string) {
  return page.getByRole('heading', { level: 2, name, exact: true });
}

async function currentPart(page: Page): Promise<string | null> {
  return partNav(page).locator('[aria-current="location"]').textContent();
}

/** Waits until a smooth scroll has come to rest, so positions are final. */
async function settleScroll(page: Page): Promise<void> {
  let previous = -1;
  for (;;) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === previous) return;
    previous = y;
    await page.waitForTimeout(SETTLE_POLL_MS);
  }
}

type Box = { top: number; bottom: number; left: number; right: number };

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

async function boxOf(page: Page, selector: string): Promise<Box> {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const { top, bottom, left, right } = element.getBoundingClientRect();
      return { top, bottom, left, right };
    });
}

test.describe('part indicator', () => {
  for (const study of caseStudies) {
    test(`/work/${study.slug}: each link jumps to its part and marks it`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);
      const links = partNav(page).getByRole('link');
      await expect(links).toHaveText(PARTS.map((part) => part.short));
      await expect(partNav(page).getByRole('link', { name: 'Reported' })).toHaveAttribute('aria-current', 'location');

      // Out of order on purpose: a jump backwards must land as well as one forwards.
      for (const part of [PARTS[2], PARTS[3], PARTS[0], PARTS[1]]) {
        await partNav(page).getByRole('link', { name: part.short }).click();
        await settleScroll(page);

        const heading = partHeading(page, part.heading);
        await expect(heading).toBeFocused();
        await expect(heading).toBeInViewport();
        expect(await currentPart(page)).toBe(part.short);
        await expect(partNav(page).locator('[aria-current]')).toHaveCount(1);
      }
    });

    test(`/work/${study.slug}: scrolling by hand moves the marked part`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);
      const seen: string[] = [];

      for (let step = 0; step < MAX_WHEEL_STEPS; step += 1) {
        const part = await currentPart(page);
        if (part && seen.at(-1) !== part) seen.push(part);
        if (part === 'Evidence') break;
        await scrollByHand(page, WHEEL_STEP_PX);
        await page.waitForTimeout(SETTLE_POLL_MS);
      }

      expect(seen).toEqual(PARTS.map((part) => part.short));
    });

    test(`/work/${study.slug}: evidence reads as published at every scroll position`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);
      const evidence = page.locator('section[aria-labelledby="evidence"]');
      const values = evidence.locator('dd > span:first-child');

      const read = async () => values.evaluateAll((spans: HTMLElement[]) => spans.map((span) => span.innerText));
      const published = study.evidence.map((figure) => figure.value);

      expect(await read()).toEqual(published);
      await evidence.scrollIntoViewIfNeeded();
      await settleScroll(page);
      expect(await read()).toEqual(published);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await settleScroll(page);
      expect(await read()).toEqual(published);
    });
  }

  test('a keyboard reader can tab into the indicator and follow it', async ({ page }) => {
    const study = caseStudies[0];
    test.skip(!study, 'no case studies');
    await page.goto(`/work/${study?.slug ?? ''}`);

    // The back link is the last stop before the indicator.
    await page.getByRole('link', { name: '← All work' }).focus();
    await page.keyboard.press(nextFocusKey(page));
    await expect(partNav(page).getByRole('link', { name: 'Reported' })).toBeFocused();

    await page.keyboard.press(nextFocusKey(page));
    await page.keyboard.press(nextFocusKey(page));
    const shipped = partNav(page).getByRole('link', { name: 'Shipped' });
    await expect(shipped).toBeFocused();

    await page.keyboard.press('Enter');
    await settleScroll(page);
    await expect(partHeading(page, 'What shipped')).toBeFocused();
    await expect(shipped).toHaveAttribute('aria-current', 'location');
  });
});

test.describe('every width and height', () => {
  // The matrix sets its own viewports, so one project covers it.
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}×${viewport.height}: no sideways scroll, and the indicator never covers a part heading`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);

      for (const study of caseStudies) {
        await page.goto(`/work/${study.slug}`);
        const scrollWidth = () => page.evaluate(() => document.documentElement.scrollWidth);
        expect(await scrollWidth(), `/work/${study.slug} scrolls sideways`).toBeLessThanOrEqual(viewport.width);

        for (const part of PARTS) {
          await partNav(page).getByRole('link', { name: part.short }).click();
          await settleScroll(page);
          expect(await currentPart(page)).toBe(part.short);

          const nav = await boxOf(page, 'nav[aria-label="Case study parts"]');
          const heading = await partHeading(page, part.heading).evaluate((element) => {
            const { top, bottom, left, right } = element.getBoundingClientRect();
            return { top, bottom, left, right };
          });
          const header = await boxOf(page, 'body > header');

          expect(overlaps(nav, heading), `${study.slug} at ${part.short}: the indicator covers the heading`).toBe(
            false,
          );
          expect(
            heading.top,
            `${study.slug} at ${part.short}: the heading is under the site header`,
          ).toBeGreaterThanOrEqual(header.bottom);
          expect(await scrollWidth()).toBeLessThanOrEqual(viewport.width);
        }
      }
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const study of DIAGRAM_STUDIES) {
    test(`/work/${study.slug}: the diagram is whole before it is reached`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);

      // Read at the top of the page, where a staged diagram would still be empty.
      const hidden = await page.locator('[data-diagram-stage]').evaluateAll((groups) =>
        groups.flatMap((group) =>
          [group, ...group.querySelectorAll('*')]
            // A `transform` attribute is where the drawing places a shape, not motion.
            .filter((element) => !element.hasAttribute('transform'))
            .map((element) => getComputedStyle(element))
            .filter((style) => style.opacity !== '1' || style.transform !== 'none')
            .map((style) => `${style.opacity} ${style.transform}`),
        ),
      );

      await expect(page.locator('[data-diagram-stage]')).toHaveCount(4);
      expect(hidden, 'a diagram element is faded or transformed under reduced motion').toEqual([]);
    });
  }

  for (const study of caseStudies) {
    test(`/work/${study.slug}: the quote and the figures are still`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);

      const moving = await page.evaluate(
        () =>
          [...document.querySelectorAll('.reported-quote, .reported-quote *, .count-up *')]
            .map((element) => getComputedStyle(element))
            .filter((style) => style.transform !== 'none' || style.opacity !== '1')
            .filter((style) => style.display !== 'none').length,
      );

      // Covers the counting figure too: under reduced motion its published value is never left at opacity 0.
      expect(moving).toBe(0);
    });
  }
});

test.describe('accessibility mid-story', () => {
  const study = DIAGRAM_STUDIES[0] ?? caseStudies[0];

  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: a case study scrolled to its middle has no serious or critical violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`/work/${study?.slug ?? ''}`);
      await partNav(page).getByRole('link', { name: 'Actually' }).click();
      await scrollByHand(page, WHEEL_STEP_PX);
      await settleScroll(page);

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
