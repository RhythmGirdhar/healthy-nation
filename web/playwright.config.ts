import { defineConfig, devices } from "@playwright/test";
import { join } from "node:path";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    channel: process.platform === "win32" ? "msedge" : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: {
    command: `node "${join("scripts", "serve-static.mjs")}" --hostname 127.0.0.1 --port 3100`,
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
