import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("should display the dashboard heading at the root URL", async ({ page }) => {
    const dashboardHeader = page.getByRole("heading", {
      name: /Dashboard/i,
    });
    await expect(dashboardHeader).toBeVisible();
    const url = page.url();
    expect(url.endsWith("/") || url.includes("/dashboard")).toBeTruthy();
  });

  test("should display all sidebar navigation links", async ({ page }) => {
    const expectedLinks = [
      "Dashboard",
      "Incidents",
      "Search",
      "Reports",
      "User Management",
      "Access Control",
      "Manual Upload",
      "VMP Approval",
    ];
    for (const linkName of expectedLinks) {
      await expect(page.getByRole("link", { name: linkName })).toBeVisible();
    }
  });
});
