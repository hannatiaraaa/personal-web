import { expect, test } from '@playwright/test';
import { identity, supersededFigures } from '../src/content/facts';
import { caseStudies } from '../src/content/case-studies';

const ROUTES = ['/', '/work', '/stack', '/about', '/cv', ...caseStudies.map((s) => `/work/${s.slug}`)];

/**
 * The two failures that would be publicly embarrassing and silently easy: a
 * superseded figure pasted back in from an older draft, and a self-applied
 * "Senior" that the title policy rules out. Both are asserted rather than
 * remembered.
 */
test.describe('factual authority', () => {
  for (const route of ROUTES) {
    test(`${route} carries no superseded figure`, async ({ page }) => {
      await page.goto(route);
      const body = (await page.locator('body').innerText()).toLowerCase();

      for (const figure of supersededFigures) {
        expect(body, `${route} must not state the superseded figure "${figure}"`).not.toContain(figure.toLowerCase());
      }
    });
  }

  for (const route of ROUTES) {
    test(`${route} never self-applies "Senior"`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();
      expect(html, `${route} must not describe her as Senior — Brand_and_Headlines.md r14`).not.toMatch(/senior/i);
    });
  }
});

test.describe('no placeholder content', () => {
  const FORBIDDEN = ['test title', 'hello this is description', 'lorem ipsum', 'todo:', 'coming soon', 'nextra'];

  for (const route of ROUTES) {
    test(`${route} is finished`, async ({ page }) => {
      await page.goto(route);
      const body = (await page.locator('body').innerText()).toLowerCase();

      for (const phrase of FORBIDDEN) {
        expect(body, `${route} still contains placeholder text "${phrase}"`).not.toContain(phrase);
      }
      expect(body.trim().length, `${route} rendered almost nothing`).toBeGreaterThan(400);
    });
  }
});

test.describe('confidentiality ceiling', () => {
  // The published abstraction level is architecture and rounded numbers. A
  // schema or ERD leaking into prose is the realistic way that slips.
  const FORBIDDEN = ['erd', 'wintermar offshore marine group tbk.', 'select *', 'create table'];

  for (const study of caseStudies) {
    test(`/work/${study.slug} stays at the published abstraction level`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);
      const body = (await page.locator('body').innerText()).toLowerCase();

      for (const phrase of FORBIDDEN) {
        expect(body).not.toContain(phrase);
      }
    });
  }
});

test.describe('case study structure', () => {
  for (const study of caseStudies) {
    test(`/work/${study.slug} has all four parts`, async ({ page }) => {
      await page.goto(`/work/${study.slug}`);

      for (const legend of ['How it was reported', 'What it actually was', 'What shipped', 'Evidence']) {
        await expect(page.getByText(legend, { exact: true })).toBeVisible();
      }

      await expect(page.getByRole('blockquote')).toContainText(study.reported);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(study.title);
    });
  }
});

test.describe('stack page reflects current work', () => {
  test('drops the terms that pull the wrong recruiters', async ({ page }) => {
    await page.goto('/stack');
    const body = (await page.locator('body').innerText()).toLowerCase();

    for (const term of ['matlab', 'maple', 'mathematica', 'microsoft 365', 'antdesign', 'onesignal', 'android sdk']) {
      expect(body, `/stack must not list "${term}" — Brand_and_Headlines.md §5`).not.toContain(term);
    }
  });

  test('lists the current stack', async ({ page }) => {
    await page.goto('/stack');
    const body = await page.locator('body').innerText();

    for (const term of ['WatermelonDB', 'Expo', 'NestJS', 'Playwright', 'Bun', 'Next.js 15']) {
      expect(body).toContain(term);
    }
  });
});

test.describe('routes and metadata', () => {
  for (const route of ROUTES) {
    test(`${route} responds 200 with its own title and description`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      await expect(page).toHaveTitle(/Hanna Tiara Andarlia/);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(60);
    });
  }

  test('the 2023 paths redirect rather than 404', async ({ page }) => {
    for (const [from, to] of [
      ['/projects', '/work'],
      ['/skills', '/stack'],
    ] as const) {
      const response = await page.goto(from);
      expect(response?.status(), `${from} should not 404`).toBe(200);
      expect(new URL(page.url()).pathname, `${from} should land on ${to}`).toBe(to);
    }
  });

  test('sitemap and robots are served and list every route', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const route of ROUTES) {
      const expected = route === '/' ? '' : route;
      expect(xml).toContain(`hannatiaraaa.vercel.app${expected}<`);
    }

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');
  });

  test('the share card renders', async ({ request }) => {
    const response = await request.get('/opengraph-image');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('the CV is indexable text and the PDF is self-hosted', async ({ page, request }) => {
    await page.goto('/cv');
    const body = await page.locator('body').innerText();
    expect(body).toContain('Founding Engineer');
    expect(body).toContain('Nalagenetics');
    expect(body.length, 'the CV should render as real text, not a download link').toBeGreaterThan(3000);

    const pdf = await request.get('/hanna-tiara-andarlia-resume.pdf');
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
  });

  test('no asset URL resolves to undefined', async ({ page }) => {
    await page.goto('/');

    // Only the URLs matter. Framework payload scripts legitimately serialise
    // the word, so asserting on the whole document would be noise.
    const urls = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[src], [href]')).map(
        (node) => node.getAttribute('src') ?? node.getAttribute('href') ?? '',
      ),
    );

    for (const url of urls) {
      expect(url, 'an asset URL was built from an unset environment variable').not.toContain('undefined');
    }
  });
});

test.describe('the hero', () => {
  // The visualisation sits above the fold on purpose — it is the one thing on
  // the site nobody else has. What must be visible without scrolling is the
  // brand line and the pool; the name, the claim and the figures follow and are
  // asserted to exist.
  test('the pool is visible without scrolling', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('GMT+7').first()).toBeInViewport();
    await expect(page.locator('canvas').first()).toBeInViewport();
  });

  test('the layers are named, so the piece reads as a path rather than a screensaver', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();

    expect(body).toContain('golden angle');
    expect(body).toContain('thesis');
    expect(body).toContain('Fibonacci');
  });

  test('the canvas tells assistive tech what it is and how to touch it', async ({ page }) => {
    await page.goto('/');

    const label = await page.locator('canvas').first().getAttribute('aria-label');
    expect(label).toMatch(/golden angle/);
    expect(label).toMatch(/ripple/);
  });

  test('the name, the claim and the figures are on the page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: 'Hanna Tiara Andarlia' })).toBeVisible();
    await expect(page.getByText('learned my way to the end of the pipeline')).toBeVisible();
    await expect(page.locator('dl').first()).toBeVisible();
  });

  test('the 2023 gimmicks are gone', async ({ page }) => {
    await page.goto('/');
    const body = (await page.locator('body').innerText()).toLowerCase();

    expect(body).not.toContain('full time learner');
    expect(body).not.toContain('hello world');
    expect(body).not.toContain('recruiter');
  });
});

test.describe('the route header comes from the layout', () => {
  // It used to be repeated in four pages. Hoisting it means the layout has to
  // put exactly one on the routes that want one, and none on the routes that
  // bring their own.
  for (const [route, title] of [
    ['/work', 'Each of these is one problem that turned out to be something else'],
    ['/stack', 'Grouped by what I would reach for on Monday'],
    ['/about', 'learned my way to the end of the pipeline'],
    ['/cv', 'Hanna Tiara Andarlia'],
  ] as const) {
    test(`${route} gets exactly one header, with its own title`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(title);
    });
  }

  test('the home page keeps its own masthead and gains no second header', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Hanna Tiara Andarlia');
  });

  test('the hero keeps one headline across both layouts', async ({ page }) => {
    for (const size of [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(size);
      await page.goto('/');

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByText(identity.brandLine, { exact: false }).first()).toBeVisible();
    }
  });

  test('a case study keeps its own header, not the work index one', async ({ page }) => {
    await page.goto('/work/offline-draft-ownership');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Offline drafts had no owner');
    await expect(page.getByText('Each of these is one problem')).toHaveCount(0);
  });
});
