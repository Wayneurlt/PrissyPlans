import { defineConfig, devices } from '@playwright/test'

/**
 * Browser end-to-end tests. Point at a running server:
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 * Uses the locally installed Chrome by default (set E2E_BROWSER_CHANNEL="" to use
 * Playwright's bundled Chromium after `npx playwright install chromium`).
 */
const channel = process.env.E2E_BROWSER_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  // The local `prisma dev` database uses a single connection, so keep parallelism low.
  workers: Number(process.env.E2E_WORKERS) || 2,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    ...(channel ? { channel } : {}),
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...(channel ? { channel } : {}) } },
  ],
})
