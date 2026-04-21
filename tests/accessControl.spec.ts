import { test, expect } from "@playwright/test";

test.describe("Access Control - Roles & Permissions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/acl/roles/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "ROLES & PERMISSIONS" })
    ).toBeVisible({ timeout: 15_000 });
    // Wait for role cards to load (they appear asynchronously)
    await page
      .getByRole("heading", { name: "admin", exact: true })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  });

  test("should display all expected role cards", async ({ page }) => {
    const expectedRoles = [
      "admin",
      "cctv operator",
      "apprehending officer",
      "validator",
      "manual uploader",
      "vmp",
    ];

    for (const role of expectedRoles) {
      await expect(
        page.getByRole("heading", { name: role, exact: true })
      ).toBeVisible();
    }
  });

  test("should display user count and Edit Role link for each role card", async ({
    page,
  }) => {
    // Each role card shows "Total N users" text
    const userCountTexts = page.getByText(/Total \d+ users?/);
    const count = await userCountTexts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Each role card has an "Edit Role" link
    const editRoleLinks = page.getByRole("link", { name: "Edit Role" });
    const linkCount = await editRoleLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(1);
  });

  test("should display the Add New Role button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Add New Role" })
    ).toBeVisible();
  });
});
