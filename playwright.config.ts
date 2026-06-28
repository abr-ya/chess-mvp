import "dotenv/config";

import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

process.env.CLERK_PUBLISHABLE_KEY ??=
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const systemChromium = existsSync("/usr/bin/chromium")
  ? "/usr/bin/chromium"
  : undefined;

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "clerk setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["clerk setup"],
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: systemChromium
          ? { executablePath: systemChromium }
          : undefined,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
