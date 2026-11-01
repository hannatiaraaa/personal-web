import { expect, test } from '@playwright/test';
import { caseStudies } from '../src/content/case-studies';
import { findFocusWithoutIndicator, findLayoutFaults, findSmallTapTargets } from './support/geometry';
import { nextFocusKey } from './support/input';

const PAGES = [
  '/',
  '/about',
  '/work',
  ...caseStudies.map((study) => `/work/${study.slug}`),
  '/stack',
  '/cv',
  '/not-a-page',
];

/** Phones portrait and landscape, a tablet, a short laptop, a laptop and a desktop. */
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 428, height: 926 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

/** Enough stops to pass the header and reach the page's own controls. */
const FOCUS_STOPS = 8;

/**
 * Every page at every size in every engine: nothing outside the viewport or
 * cut by a clipping ancestor (which a scroll-width check alone misses), no
 * siblings on top of each other, cards apart, one h1 and no skipped heading
 * level; on a touch screen, every standalone control at least 44px. The theme
 * alternates by size, so both are covered without doubling the run.
 */
for (const path of PAGES) {
  test(`${path} lays out cleanly at every size`, async ({ page, isMobile }) => {
    test.slow();
    const faults: string[] = [];

    for (const [index, viewport] of VIEWPORTS.entries()) {
      await page.emulateMedia({ colorScheme: index % 2 === 0 ? 'light' : 'dark' });
      await page.setViewportSize(viewport);
      await page.goto(path);

      const found = [...(await findLayoutFaults(page)), ...(isMobile ? await findSmallTapTargets(page) : [])];
      faults.push(...found.map((fault) => `${viewport.width}×${viewport.height}: ${fault}`));
    }

    expect(faults).toEqual([]);
  });

  test(`${path} shows where keyboard focus is`, async ({ page }) => {
    await page.goto(path);

    expect(await findFocusWithoutIndicator(page, nextFocusKey(page), FOCUS_STOPS)).toEqual([]);
  });
}
