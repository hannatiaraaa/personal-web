import { defineConfig, devices } from '@playwright/test';

const PORT = 3210;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Runs against the production build, not the dev server — the thing that ships
 * is the thing that gets asserted. Two viewports, because half the acceptance
 * criteria are about what is visible without scrolling.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `bun run start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
