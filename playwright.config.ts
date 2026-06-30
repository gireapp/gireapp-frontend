import { defineConfig } from '@playwright/test';

/**
 * GIREAPP — Playwright Configuration
 * Visual regression + performance tests for landing page
 * Breakpoints: 375px (mobile), 768px (tablet), 1440px (desktop)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'mobile-375',
      use: {
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'tablet-768',
      use: {
        viewport: { width: 768, height: 1024 },
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    },
    {
      name: 'desktop-1440',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  /* Start local dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
