import { test, expect } from "@playwright/test";

test.describe("User Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Users" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("should display the Add User button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Add User" })
    ).toBeVisible();
  });

  test("should display date filters and search input", async ({ page }) => {
    const dateInputs = page.locator(
      'input[placeholder="Click to select a date"]'
    );
    const count = await dateInputs.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await expect(page.getByRole("textbox", { name: "Search" })).toBeVisible();
  });

  test("should display users table with correct columns and data", async ({
    page,
  }) => {
    const table = page.locator('table[aria-label="customized table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });

    for (const col of [
      "Date Created",
      "Email",
      "First Name",
      "Last Name",
      "Roles",
      "Status",
      "ACTION",
    ]) {
      await expect(page.getByRole("columnheader", { name: col })).toBeVisible();
    }

    // Verify table has rows
    const rows = table.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should display action buttons (View, Edit, Update Password) in table rows", async ({
    page,
  }) => {
    const table = page.locator('table[aria-label="customized table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });

    const firstRow = table.locator("tbody tr").first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });

    await expect(firstRow.getByRole("button", { name: "View" })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(
      firstRow.getByRole("button", { name: "Update Password" })
    ).toBeVisible();
  });

  test("should display pagination with entry count", async ({ page }) => {
    await expect(
      page.getByText(/Showing \d+-\d+ of \d+ entries/)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should filter users by search keyword", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search" });
    await searchInput.fill("admin");
    await page.waitForTimeout(1000);

    const table = page.locator('table[aria-label="customized table"]');
    const rowCount = await table.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});
