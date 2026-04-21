import { test, expect } from "@playwright/test";

test.describe("Incidents Page - Tab Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "INCIDENTS" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("should display all five tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /VALIDATION/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /APPROVAL/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: "TICKET" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Rejected" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "ARCHIVED" })).toBeVisible();
  });

  test("should display badge counts on Validation and Approval tabs", async ({ page }) => {
    // Tabs show numeric badge counts (e.g., "VALIDATION 134680", "APPROVAL 24")
    const validationTab = page.getByRole("tab", { name: /VALIDATION/ });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });

    const validationText = await validationTab.textContent();
    const approvalText = await approvalTab.textContent();

    // Verify VALIDATION tab has a numeric count
    expect(validationText).toMatch(/VALIDATION\s*\d+/);
    // Verify APPROVAL tab has a numeric count
    expect(approvalText).toMatch(/APPROVAL\s*\d+/);
  });

  test("should switch between all tabs sequentially and track selection", async ({ page }) => {
    const tabs = [
      { name: /VALIDATION/ },
      { name: /APPROVAL/ },
      { name: "TICKET" },
      { name: "Rejected" },
      { name: "ARCHIVED" },
    ];

    for (const tab of tabs) {
      const tabElement = page.getByRole("tab", { name: tab.name });
      await tabElement.click();
      await expect(tabElement).toHaveAttribute("aria-selected", "true");
    }
  });

  test("should navigate into batch details from the TICKET tab", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "TICKET" }).click();
    await expect(
      page.getByRole("heading", { name: "Batches" })
    ).toBeVisible();

    const batchesTable = page.locator(
      'table[aria-label="batches table"], table[aria-label="customized table"]'
    );
    await expect(batchesTable.first()).toBeVisible({ timeout: 10_000 });

    const firstRow = batchesTable.first().locator("tbody tr").first();
    try {
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      test.skip(true, "No batches available to view");
      return;
    }

    const viewButton = firstRow.getByRole("button", { name: "View" });
    await viewButton.click();
    await expect(
      page.getByRole("heading", { name: /Batch Number/ })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should display Ticket tab filters, columns, and action buttons", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "TICKET" }).click();

    // Verify filters
    await expect(
      page.getByRole("textbox", { name: "Start Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "End Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Batch Number" })
    ).toBeVisible();

    // Wait for table
    const table = page.locator('table[aria-label="batches table"]');
    try {
      await table.first().waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      test.skip(true, "No batches available");
      return;
    }

    // Verify columns
    for (const col of ["DATE", "BATCH NUMBER", "AI CAPTURES", "MANUAL UPLOAD", "ACTION"]) {
      await expect(
        page.getByRole("columnheader", { name: col })
      ).toBeVisible();
    }

    // Verify pagination
    await expect(page.getByText(/Showing \d+.*of \d+ entries/)).toBeVisible();

    // Verify action buttons in first row
    const firstRow = table.locator("tbody tr").first();
    try {
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      return; // No rows, but filters/columns verified
    }

    await expect(firstRow.getByRole("button", { name: "Print" })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "View" })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "PDF" })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "CSV" })).toBeVisible();
  });

  test("should display Rejected tab filters, columns, and action buttons", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Rejected" }).click();

    // Verify filters
    await expect(
      page.getByRole("textbox", { name: "Start Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "End Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Plate Number" })
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Location" })
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Violation" })
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Invalid Reason" })
    ).toBeVisible();

    // Wait for table
    const table = page.locator('table[aria-label="invalid violations table"]');
    try {
      await table.first().waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      test.skip(true, "No rejected violations available");
      return;
    }

    // Verify columns
    for (const col of [
      "DATE VIOLATED",
      "PLATE NUMBER",
      "CAMERA LOCATION",
      "REASON",
      "DATE INVALIDATED",
      "INVALIDATED BY",
      "ACTION",
    ]) {
      await expect(
        page.getByRole("columnheader", { name: col })
      ).toBeVisible();
    }

    // Verify pagination
    await expect(page.getByText(/Showing \d+.*of \d+ entries/)).toBeVisible();

    // Verify action button in first row
    const firstRow = table.locator("tbody tr").first();
    try {
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      return;
    }
    await expect(firstRow.getByRole("button", { name: "more" })).toBeVisible();
  });

  test("should display Archived tab filters, columns, and action buttons", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ARCHIVED" }).click();

    // Verify filters
    await expect(
      page.getByRole("textbox", { name: "Start Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "End Date" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Plate Number" })
    ).toBeVisible();

    // Wait for table
    const table = page.locator(
      'table[aria-label="archived violations table"]'
    );
    try {
      await table.first().waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      test.skip(true, "No archived violations available");
      return;
    }

    // Verify columns
    for (const col of [
      "ARCHIVED ON",
      "DATE",
      "PLATE NUMBER",
      "REASON",
      "ARCHIVED BY",
      "ACTION",
    ]) {
      await expect(
        page.getByRole("columnheader", { name: col })
      ).toBeVisible();
    }

    // Verify pagination
    await expect(page.getByText(/Showing \d+.*of \d+ entries/)).toBeVisible();

    // Verify action button in first row
    const firstRow = table.locator("tbody tr").first();
    try {
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      return;
    }
    await expect(firstRow.getByRole("button", { name: "more" })).toBeVisible();
  });
});
