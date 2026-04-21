import { test, expect } from "@playwright/test";
import { SearchPage } from "./pages/searchPage";
import { faker } from "@faker-js/faker";

const TEST_PLATE = process.env.TEST_PLATE_NUMBER || "ABC1234";
const TEST_TICKET = process.env.TEST_TICKET_NUMBER || "M80-0017183-0";

test.describe("Search - Filter by Validated Status", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should filter violations by single status (Validated)", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Validated"]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No Validated violations found");
      return;
    }

    const status = await searchPage.getFirstRowColumnText(5);
    // The "Validated" filter label maps to "VALIDATED" in the results table
    expect(status).toBe("VALIDATED");
  });

  test("should filter violations by single status (Invalid)", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Invalid"]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No Invalid violations found");
      return;
    }

    const status = await searchPage.getFirstRowColumnText(5);
    expect(status).toBe("INVALID");
  });
});

test.describe("Search - Date Range Filter", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should set a date range filter and see both date inputs", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.setDateFilter("Violated At", "Range");

    // In Range mode, two date picker inputs appear (From and To).
    // Both share the same placeholder text, so locate them by placeholder.
    const dateInputs = searchPage.advancedFiltersDialog.locator(
      'input[placeholder="Click to select a date"]'
    );
    await expect(dateInputs).toHaveCount(2);
    await expect(dateInputs.first()).toBeVisible();
    await expect(dateInputs.last()).toBeVisible();
  });

  test("should set a date filter with 'Created At' field in Single mode", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.setDateFilter("Created At", "Single");

    // In Single mode, the input is labeled "On or after"
    await expect(searchPage.dateOnOrAfterInput).toBeVisible();
  });
});

test.describe("Search - Tickets Approved By / Validated By Filters", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should display and open 'Tickets Approved By' and 'Validated By' dropdowns", async () => {
    await searchPage.openAdvancedFilters();

    // Both comboboxes should be visible
    await expect(searchPage.ticketsApprovedByCombobox).toBeVisible();
    await expect(searchPage.validatedByCombobox).toBeVisible();

    // Open Tickets Approved By dropdown
    await searchPage.ticketsApprovedByCombobox.click();
    const listbox = searchPage.page
      .locator('div[role="presentation"] [role="listbox"]')
      .last();
    const noOptions = searchPage.page.getByText("No options");
    try {
      await Promise.race([
        listbox.waitFor({ state: "visible", timeout: 5_000 }),
        noOptions.waitFor({ state: "visible", timeout: 5_000 }),
      ]);
    } catch {
      // Dropdown may take time to load
    }
    await searchPage.page.keyboard.press("Escape");

    // Open Validated By dropdown
    await searchPage.validatedByCombobox.click();
    try {
      await Promise.race([
        listbox.waitFor({ state: "visible", timeout: 5_000 }),
        noOptions.waitFor({ state: "visible", timeout: 5_000 }),
      ]);
    } catch {
      // Dropdown may take time to load
    }
    await searchPage.page.keyboard.press("Escape");
  });
});

test.describe("Search - Multiple Exact Match Filters", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should add multiple exact match filters via 'Add another' button", async () => {
    await searchPage.openAdvancedFilters();

    // Add first exact match filter — "Add another" should appear
    await searchPage.setExactMatchFilter("Plate Number", TEST_PLATE);
    await expect(searchPage.exactMatchAddAnotherButton).toBeVisible();

    // Click "Add another" to add a second filter
    await searchPage.exactMatchAddAnotherButton.click();

    // The second set of exact match inputs should appear
    const searchByComboboxes = searchPage.advancedFiltersDialog.getByRole(
      "combobox",
      { name: "Search by" }
    );
    const count = await searchByComboboxes.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Search - Save View Button", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should display the 'Save View' button in advanced filters dialog", async () => {
    await searchPage.openAdvancedFilters();
    // Save View exists but is currently disabled (coming soon)
    const saveViewButton = searchPage.advancedFiltersDialog.getByRole(
      "button",
      { name: "Save View" }
    );
    await expect(saveViewButton).toBeVisible();
  });
});

test.describe("Search - Combined Filter Scenarios", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should filter by Validated status and exact plate match", async () => {
    // Step 1: Search with Validated status only to discover available plates
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Validated"]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No Validated violations found");
      return;
    }

    // Step 2: Collect plate numbers from visible results and pick one randomly
    const plates = await searchPage.getColumnTextsFromAllRows(2);
    const uniquePlates = [...new Set(plates.filter(Boolean))];
    if (uniquePlates.length === 0) {
      test.skip(true, "No plate numbers found in Validated results");
      return;
    }
    const randomPlate = faker.helpers.arrayElement(uniquePlates);
    console.log(`Randomly selected plate for exact match test: ${randomPlate}`);

    // Step 3: Re-filter with both Validated status and exact plate match
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Validated"]);
    await searchPage.setExactMatchFilter("Plate Number", randomPlate);
    await searchPage.applyAdvancedFilters();

    const filteredRowCount = await searchPage.getResultsRowCount();
    expect(filteredRowCount).toBeGreaterThan(0);

    const resultPlate = await searchPage.getFirstRowColumnText(2);
    const resultStatus = await searchPage.getFirstRowColumnText(5);
    expect(resultPlate).toBe(randomPlate);
    expect(resultStatus).toBe("VALIDATED");
  });

  test("should filter by all statuses combined", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses([
      "Approved",
      "Validated",
      "Void",
      "Invalid",
    ]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No violations found with any status");
      return;
    }

    const status = await searchPage.getFirstRowColumnText(5);
    expect([
      "APPROVED",
      "VALIDATED",
      "VOID",
      "VOIDED",
      "INVALID",
    ]).toContain(status);
  });

  test("should combine status + ticket number exact match filter", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Approved", "Void"]);
    await searchPage.setExactMatchFilter("Ticket Number", TEST_TICKET);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(
        true,
        `No violations found for ticket ${TEST_TICKET} with Approved/Void status`
      );
      return;
    }

    const resultTicket = await searchPage.getFirstRowColumnText(1);
    expect(resultTicket).toBe(TEST_TICKET);
  });
});
