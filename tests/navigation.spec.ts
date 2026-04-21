import { test, expect } from "@playwright/test";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("should navigate to the Incidents page", async ({ page }) => {
    await page.getByRole("link", { name: "Incidents" }).click();
    await expect(page).toHaveURL(/.*\/violations\/processing/);
    await expect(
      page.getByRole("heading", { name: "INCIDENTS" })
    ).toBeVisible();
  });

  test("should navigate to the Search page", async ({ page }) => {
    await page.getByRole("link", { name: "Search" }).click();
    await expect(page).toHaveURL(/.*\/violations\/search/);
  });

  test("should navigate to the Manual Upload page", async ({ page }) => {
    await page.getByRole("link", { name: "Manual Upload" }).click();
    await expect(page).toHaveURL(/.*\/manual-upload/);
    await expect(
      page.getByRole("heading", { name: "Manual Upload" })
    ).toBeVisible();
  });

  test("should navigate to the Reports page", async ({ page }) => {
    await page.getByRole("link", { name: "Reports" }).click();
    await expect(page).toHaveURL(/.*\/reports/);
    await expect(
      page.getByRole("heading", { name: "REPORTS" })
    ).toBeVisible();
  });

  test("should navigate to the User Management page", async ({ page }) => {
    await page.getByRole("link", { name: "User Management" }).click();
    await expect(page).toHaveURL(/.*\/users/);
    await expect(
      page.getByRole("heading", { name: "Users" })
    ).toBeVisible();
  });

  test("should navigate to the Access Control page", async ({ page }) => {
    await page.getByRole("link", { name: "Access Control" }).click();
    await expect(page).toHaveURL(/.*\/acl\/roles/);
    await expect(
      page.getByRole("heading", { name: "ROLES & PERMISSIONS" })
    ).toBeVisible();
  });

  test("should navigate to the VMP Approval page", async ({ page }) => {
    await page.getByRole("link", { name: "VMP Approval" }).click();
    await expect(page).toHaveURL(/.*\/vmp/);
    await expect(
      page.getByRole("heading", { name: "VMP APPROVAL" })
    ).toBeVisible();
  });

  test("should navigate back to the Dashboard", async ({ page }) => {
    await page.getByRole("link", { name: "Incidents" }).click();
    await expect(page).toHaveURL(/.*\/violations\/processing/);

    await page.getByRole("link", { name: "Dashboard" }).click();
    const dashboardHeader = page.getByRole("heading", {
      name: /Dashboard/i,
    });
    await expect(dashboardHeader).toBeVisible();
  });
});
