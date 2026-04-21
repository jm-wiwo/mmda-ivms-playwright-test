import { test, expect } from "@playwright/test";

test.describe("Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reports/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "REPORTS" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("should display Standard Reports and Custom Reports tabs", async ({
    page,
  }) => {
    const standardTab = page.getByRole("tab", { name: "STANDARD REPORTS" });
    const customTab = page.getByRole("tab", { name: "CUSTOM REPORTS" });

    await expect(standardTab).toBeVisible();
    await expect(customTab).toBeVisible();
    await expect(standardTab).toHaveAttribute("aria-selected", "true");
  });

  test("should display all standard report types with download buttons", async ({
    page,
  }) => {
    const expectedReports = [
      "DAILY AI APPREHENSION REPORT",
      "TL REPORT",
      "STAG APPREHENSION REPORT",
      "DAILY VIOLATION SUMMARY REPORT",
    ];

    const tabPanel = page.getByRole("tabpanel");
    for (const report of expectedReports) {
      await expect(tabPanel.getByText(report)).toBeVisible();
    }

    // Each report should have a Download button
    const downloadButtons = tabPanel.getByRole("button", { name: "Download" });
    const count = await downloadButtons.count();
    expect(count).toBe(expectedReports.length);
  });

  test("should switch to the Custom Reports tab", async ({ page }) => {
    const customTab = page.getByRole("tab", { name: "CUSTOM REPORTS" });
    await customTab.click();
    await expect(customTab).toHaveAttribute("aria-selected", "true");

    // Custom Reports tab panel should be visible
    const tabPanel = page.locator('div[role="tabpanel"]:not([hidden])');
    await expect(tabPanel).toBeVisible();
  });
});
