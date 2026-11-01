import { expect, test, type Page } from '@playwright/test';
import { APPROVED_MODES } from './support/approved-modes';
import { measureSceneFit, measureVisualFit } from './support/geometry';

/**
 * The fit rule, on every page with a scroll story. At every approved laptop and
 * desktop size, at any height, each scene pins, its scroll moves it on, and its held visual is
 * never cut by the screen or hidden under the header or the part bar. Below
 * that nothing is sticky, and the stories play by themselves.
 *
 * Which sizes pin is the approved table in support/approved-modes.ts, written
 * out by hand: never read the threshold from `src/`, or a change to it moves
 * the test along with it.
 */

const ROUTES = [
  '/',
  '/about',
  '/stack',
  '/work/offline-draft-ownership',
  '/work/one-arithmetic-ladder',
  '/work/release-gate-from-zero',
] as const;

/** Laptop and desktop windows, short ones included: approved to pin at any height. */
const LAPTOPS = [
  { width: 1024, height: 600 },
  { width: 1024, height: 640 },
  { width: 1024, height: 768 },
  { width: 1280, height: 600 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 560 },
  { width: 1440, height: 800 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
  { width: 2000, height: 600 },
  { width: 2000, height: 700 },
  { width: 2000, height: 1100 },
] as const;

/** A phone, a landscape phone, a portrait tablet and a window a pixel under 1024 wide: approved in flow. */
const BELOW_FIT = [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1023, height: 800 },
] as const;

/** Every scroll story, its scene (the element its scroll state is written on) and the visual it holds still. */
const STORIES = [
  { name: 'hero', route: '/', scene: '.hero-intro', visual: '.hero-intro-stage' },
  { name: 'home work story', route: '/', scene: '.work-story-stage', visual: '.scrolly-visual', marksStep: true },
  { name: 'about arc', route: '/about', scene: '.arc-stage', visual: '.scrolly-visual', marksStep: true },
  { name: 'stack story', route: '/stack', scene: '.stack-story', visual: '.stack-story-visual' },
  {
    name: 'draft-sync',
    route: '/work/offline-draft-ownership',
    scene: '.draft-sync-scene',
    visual: '.draft-sync-frame',
  },
  { name: 'gate run', route: '/work/release-gate-from-zero', scene: '.gate-run', visual: '.gate-run-frame' },
  {
    name: 'tax ladder',
    route: '/work/one-arithmetic-ladder',
    scene: '.tax-ladder-scene',
    visual: '.tax-ladder-sticky',
  },
] as const;

const SCENES = '.hero-intro, .scrolly-stage, .draft-sync-scene, .gate-run, .tax-ladder-scene, .stack-story';
/** Into, through and out of each scene's travel. */
const SHARES = [0.05, 0.5, 0.95] as const;
/** Six steps at 800ms, and room for a slow engine. */
const RUN_TIMEOUT_MS = 12_000;
/** Long enough for a live piece to swap in and the scroll's measurement to land. */
const SETTLE_TIMEOUT_MS = 5_000;

test('the size tables agree with the approved modes', () => {
  const mode = (width: number, height: number) =>
    APPROVED_MODES.find((row) => row.w === width && row.h === height)?.expect;
  for (const size of LAPTOPS) expect(mode(size.width, size.height)).toBe('pinned');
  for (const size of BELOW_FIT) expect(mode(size.width, size.height)).toBe('in-flow');
});

/** Scrolls to a share of the `index`th scene's travel, measured afresh: a live piece may have just swapped in. */
async function scrollIntoScene(page: Page, index: number, share: number, selector: string = SCENES): Promise<boolean> {
  const found = await page.evaluate(
    ({ selector, index, share }) => {
      const scene = document.querySelectorAll(selector)[index];
      if (!scene) return false;
      const rect = scene.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 0);
      window.scrollTo({ top: window.scrollY + rect.top + share * travel, behavior: 'instant' });
      return true;
    },
    { selector, index, share },
  );
  // Two frames: the scroll's own measurement, then the restyle it writes.
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  return found;
}

test.describe('at every laptop and desktop size, every scene pins, scrubs and fits', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of LAPTOPS) {
    for (const story of STORIES) {
      test(`${viewport.width}×${viewport.height} ${story.name}: pinned, moved on by the scroll, whole below the bars`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(story.route);
        await expect(page.locator(story.scene)).toHaveCount(1);

        const signals: string[] = [];
        for (const share of SHARES) {
          await scrollIntoScene(page, 0, share, story.scene);
          const at = `${story.name} at ${share}`;
          // Pinned: sticky, and held at its sticky top through the scene.
          await expect
            .poll(
              async () => {
                const fit = await measureVisualFit(page, story.scene, story.visual);
                return { sticky: fit.isSticky, held: fit.isHeld };
              },
              { message: `${at}: pinned`, timeout: SETTLE_TIMEOUT_MS },
            )
            .toEqual({ sticky: true, held: true });
          // Whole: nothing of it under the bars, past the screen or cropped by its frame.
          await expect
            .poll(async () => (await measureVisualFit(page, story.scene, story.visual)).faults, {
              message: `${at}: fits`,
              timeout: SETTLE_TIMEOUT_MS,
            })
            .toEqual([]);
          signals.push((await measureVisualFit(page, story.scene, story.visual)).signal);
          // Pinned, the step being read is the current one.
          if ('marksStep' in story) {
            await expect(page.locator(`${story.scene} .scrolly-step[aria-current="step"]`)).toHaveCount(1);
          }
        }

        // Scrubbed: the scroll moved the scene from where it entered.
        await expect
          .poll(async () => (await measureVisualFit(page, story.scene, story.visual)).signal, {
            message: `${story.name}: the scroll moves it on`,
            timeout: SETTLE_TIMEOUT_MS,
          })
          .not.toBe(signals[0]);

        // The arc tags the layer the current era added, popping it in: the first era adds one.
        if (story.name === 'about arc') {
          await scrollIntoScene(page, 0, SHARES[0], story.scene);
          await expect
            .poll(() =>
              page
                .locator('.arc-layer-new')
                .evaluateAll((tags) => tags.some((tag) => new DOMMatrix(getComputedStyle(tag).transform).a > 0.5)),
            )
            .toBe(true);
        }
      });
    }
  }
});

test.describe('below the fit, nothing is sticky', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const route of ROUTES) {
    for (const viewport of BELOW_FIT) {
      test(`${route} at ${viewport.width}×${viewport.height}: in flow`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route);

        const count = await page.locator(SCENES).count();
        expect(count).toBeGreaterThan(0);

        const faults: string[] = [];
        const sticky = new Set<string>();
        for (let index = 0; index < count; index += 1) {
          for (const share of SHARES) {
            if (!(await scrollIntoScene(page, index, share))) continue;
            const fit = await measureSceneFit(page);
            for (const name of fit.sticky) sticky.add(name);
            faults.push(...fit.faults.map((fault) => `scene ${index} at ${share}: ${fault}`));
          }
        }

        expect(faults).toEqual([]);
        expect([...sticky]).toEqual([]);
      });
    }
  }
});

test.describe('below the fit, stories play by themselves', () => {
  test.skip(({ isMobile }) => isMobile, 'the matrix sets its own viewport');

  for (const viewport of BELOW_FIT) {
    test(`${viewport.width}×${viewport.height}: the opening scene strikes the report without a scroll`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page.locator('.hero-intro')).toHaveAttribute('data-beat', '3', { timeout: RUN_TIMEOUT_MS });
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test(`${viewport.width}×${viewport.height}: the sync run plays to its end in view, and replays`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/work/offline-draft-ownership');

      const log = page.getByRole('group', { name: 'Event log' });
      const current = () =>
        log
          .getByRole('listitem')
          .evaluateAll((items) => items.findIndex((item) => item.getAttribute('aria-current') === 'step'));
      const drawing = page.locator('.draft-sync-stage');

      // Brought a screen ahead, the live piece loads and waits on its first step.
      await page.evaluate(() => {
        const slot = document.querySelector('.draft-sync');
        if (slot)
          window.scrollTo({ top: slot.getBoundingClientRect().top + window.scrollY - window.innerHeight * 1.5 });
      });
      await expect(page.getByRole('button', { name: 'Replay' })).toBeEnabled();
      await expect.poll(current).toBe(0);

      await drawing.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect.poll(current, { timeout: RUN_TIMEOUT_MS }).toBe(5);

      // The drawing fits the band under the bars, so the run is watched whole.
      const fits = await drawing.evaluate((element) => {
        const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
        return element.getBoundingClientRect().height <= window.innerHeight - header;
      });
      expect(fits).toBe(true);

      const replay = page.getByRole('button', { name: 'Replay' });
      const skip = page.getByRole('button', { name: 'Skip' });
      await replay.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await replay.click();
      await expect.poll(current).toBeLessThan(5);
      await expect(skip).toBeEnabled();
      await skip.click();
      await expect.poll(current).toBe(5);
      await expect(skip).toBeDisabled();
    });
  }
});
