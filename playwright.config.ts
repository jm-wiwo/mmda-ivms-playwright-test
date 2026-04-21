import * as dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: process.env.CI
    ? [["html"], ["json", { outputFile: "test_results.json" }]]
    : "html",

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // --- Admin auth setup ---
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // --- Main test project (admin, authenticated) ---
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [/loginValidation\.spec\.ts/, /roleAccess\.spec\.ts/],
    },

    // --- Unauthenticated project (login validation tests) ---
    {
      name: "unauthenticated",
      testMatch: /loginValidation\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    // --- Role-based auth setups ---
    {
      name: "setup-validator",
      testMatch: /roleAuth\.setup\.ts/,
      use: { roleName: "validator" } as any,
    },
    {
      name: "setup-approver",
      testMatch: /roleAuth\.setup\.ts/,
      use: { roleName: "approver" } as any,
    },
    {
      name: "setup-manual-uploader",
      testMatch: /roleAuth\.setup\.ts/,
      use: { roleName: "manual-uploader" } as any,
    },
    {
      name: "setup-vmp-approver",
      testMatch: /roleAuth\.setup\.ts/,
      use: { roleName: "vmp-approver" } as any,
    },

    // --- Role-based test projects ---
    {
      name: "chromium-validator",
      testMatch: /roleAccess\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/validator.json",
        roleName: "validator",
      } as any,
      dependencies: ["setup-validator"],
    },
    {
      name: "chromium-approver",
      testMatch: /roleAccess\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/approver.json",
        roleName: "approver",
      } as any,
      dependencies: ["setup-approver"],
    },
    {
      name: "chromium-manual-uploader",
      testMatch: /roleAccess\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/manual-uploader.json",
        roleName: "manual-uploader",
      } as any,
      dependencies: ["setup-manual-uploader"],
    },
    {
      name: "chromium-vmp-approver",
      testMatch: /roleAccess\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/vmp-approver.json",
        roleName: "vmp-approver",
      } as any,
      dependencies: ["setup-vmp-approver"],
    },
  ],
});
