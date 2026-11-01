import { defineConfig, devices } from '@playwright/test';

// Overridable so parallel worktrees can each serve their own build.
const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Mobile WebKit doubles the slowest engine's run for coverage the two desktop
 * engines and mobile Chromium already give, so the gate leaves it out;
 * `E2E_ALL_BROWSERS=1` runs it too.
 */
const ALL_BROWSERS = process.env.E2E_ALL_BROWSERS === '1';
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

/**
 * Runs against the production build, not the dev server — the thing that ships
 * is the thing that gets asserted. Two viewports, because half the acceptance
 * criteria are about what is visible without scrolling; three engines, because
 * a visitor may be on any of them — Firefox has no CSS scroll timelines at all.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: DESKTOP_VIEWPORT } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: DESKTOP_VIEWPORT } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: DESKTOP_VIEWPORT } },
    ...(ALL_BROWSERS ? [{ name: 'webkit-mobile', use: { ...devices['iPhone 13'] } }] : []),
  ],
  webServer: {
    command: `bun run start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
