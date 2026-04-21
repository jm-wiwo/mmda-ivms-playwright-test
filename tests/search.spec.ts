import { test, expect } from "@playwright/test";
import { SearchPage, SearchParameter } from "./pages/searchPage";
import { faker } from "@faker-js/faker";

const TEST_DATA: Record<string, string | undefined> = {
  "Plate Number": process.env.TEST_PLATE_NUMBER || "ABC1234",
  "Ticket Number": process.env.TEST_TICKET_NUMBER || "M80-0017183-0",
  "ID": process.env.TEST_VIOLATION_ID || "68d5e9fbc09e45370b85e36d",
  "Camera ID": process.env.TEST_CAMERA_ID || "7283",
};

test.describe("Search Page Functionality", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should search by default parameter (Plate Number)", async () => {
    // Pick a plate dynamically from the default results table
    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No violations in default results to pick a plate from");
      return;
    }
    const plates = await searchPage.getColumnTextsFromAllRows(2);
    const uniquePlates = [...new Set(plates.filter(Boolean))];
    if (uniquePlates.length === 0) {
      test.skip(true, "No plate numbers found in default results");
      return;
    }
    const plate = faker.helpers.arrayElement(uniquePlates);
    console.log(`Randomly selected plate for search test: ${plate}`);

    await searchPage.searchBy("Plate Number", plate);

    await searchPage.verifySearchResult("Plate Number", plate);
  });

  const parametersToTest: SearchParameter[] = [
    "Ticket Number",
    "ID",
    "Camera ID",
  ];

  for (const parameter of parametersToTest) {
    test(`should search by parameter: ${parameter}`, async () => {
      const value = TEST_DATA[parameter];
      if (!value) {
        test.skip(
          true,
          `No test data configured for parameter: ${parameter}`
        );
        return;
      }

      await searchPage.searchBy(parameter, value);

      await searchPage.verifySearchResult(parameter, value);
    });
  }
});

test.describe("Void Functionality", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should void an approved violation with reason", async () => {
    const found = await searchPage.filterAndOpenFirstViolation("APPROVED");

    if (!found) {
      test.skip(
        true,
        "No violation with status 'APPROVED' found to test void functionality"
      );
      return;
    }

    await searchPage.clickVoidButton();
    await searchPage.fillVoidReason("Test void reason");
    await searchPage.confirmAction();
  });

  test("should cancel void action when cancel is clicked", async () => {
    const found = await searchPage.filterAndOpenFirstViolation("APPROVED");

    if (!found) {
      test.skip(
        true,
        "No violation with status 'APPROVED' found to test void functionality"
      );
      return;
    }

    await searchPage.clickVoidButton();
    await searchPage.fillVoidReason("Test void reason");
    await searchPage.cancelAction();

    await expect(searchPage.voidButton).toBeVisible();
  });
});

test.describe("Advanced Filters", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should open and close the advanced filters dialog", async () => {
    await searchPage.openAdvancedFilters();
    await expect(searchPage.advancedFiltersDialog).toBeVisible();
    await expect(searchPage.applyFiltersButton).toBeVisible();
    await expect(searchPage.resetFiltersButton).toBeVisible();
    await expect(searchPage.cancelFiltersButton).toBeVisible();

    await searchPage.cancelAdvancedFilters();
    await expect(searchPage.advancedFiltersDialog).not.toBeVisible();
  });

  test("should display all default violation status chips", async () => {
    await searchPage.openAdvancedFilters();

    const chipNames = ["Approved", "Validated", "Void", "Invalid"];
    for (const name of chipNames) {
      await expect(
        searchPage.advancedFiltersDialog.getByRole("button", {
          name,
          exact: true,
        })
      ).toBeVisible();
    }
  });

  test("should show 'No filters selected' when all status chips are removed", async () => {
    await searchPage.openAdvancedFilters();

    await searchPage.selectViolationStatuses([]);

    await expect(searchPage.noFiltersMessage).toBeVisible();
  });

  test("should filter violations by single status (Approved)", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Approved"]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No Approved violations found");
      return;
    }

    const status = await searchPage.getFirstRowColumnText(5);
    expect(status).toBe("APPROVED");
  });

  test("should filter violations by single status (Void)", async () => {
    await searchPage.openAdvancedFilters();
    await searchPage.selectViolationStatuses(["Void"]);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, "No Void violations found");
      return;
    }

    const status = await searchPage.getFirstRowColumnText(5);
    expect(["VOID", "VOIDED"]).toContain(status);
  });

  test("should filter by exact match (Plate Number)", async () => {
    // Pick a real plate from the default results for a dynamic search
    const defaultRowCount = await searchPage.getResultsRowCount();
    if (defaultRowCount === 0) {
      test.skip(true, "No violations in default results to pick a plate from");
      return;
    }
    const plates = await searchPage.getColumnTextsFromAllRows(2);
    const uniquePlates = [...new Set(plates.filter(Boolean))];
    if (uniquePlates.length === 0) {
      test.skip(true, "No plate numbers found in default results");
      return;
    }
    const plate = faker.helpers.arrayElement(uniquePlates);
    console.log(`Randomly selected plate for exact match filter test: ${plate}`);

    await searchPage.openAdvancedFilters();
    await searchPage.setExactMatchFilter("Plate Number", plate);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, `No violations found for plate ${plate}`);
      return;
    }

    const resultPlate = await searchPage.getFirstRowColumnText(2);
    expect(resultPlate).toBe(plate);
  });

  test("should filter by exact match (Ticket Number)", async () => {
    const ticket = process.env.TEST_TICKET_NUMBER || "M80-0017183-0";

    await searchPage.openAdvancedFilters();
    await searchPage.setExactMatchFilter("Ticket Number", ticket);
    await searchPage.applyAdvancedFilters();

    const rowCount = await searchPage.getResultsRowCount();
    if (rowCount === 0) {
      test.skip(true, `No violations found for ticket ${ticket}`);
      return;
    }

    const resultTicket = await searchPage.getFirstRowColumnText(1);
    expect(resultTicket).toBe(ticket);
  });

  test("should reset filters to defaults", async () => {
    await searchPage.openAdvancedFilters();

    // Remove all status chips
    await searchPage.selectViolationStatuses([]);
    await expect(searchPage.noFiltersMessage).toBeVisible();

    // Reset should restore default chips
    await searchPage.resetAdvancedFilters();

    const chipNames = ["Approved", "Validated", "Void", "Invalid"];
    for (const name of chipNames) {
      await expect(
        searchPage.advancedFiltersDialog.getByRole("button", {
          name,
          exact: true,
        })
      ).toBeVisible();
    }
  });

  test("should clear all active filters", async () => {
    await searchPage.openAdvancedFilters();

    // Add an exact match filter to create an active filter
    await searchPage.setExactMatchFilter("Plate Number", "TEST123");

    // Clear all
    await searchPage.clearAllActiveFilters();

    await expect(searchPage.noFiltersMessage).toBeVisible();
  });

  test("should set a date field filter", async () => {
    await searchPage.openAdvancedFilters();

    await searchPage.setDateFilter("Violated At", "Single");

    // Verify the date input is visible
    await expect(searchPage.dateOnOrAfterInput).toBeVisible();
  });

  test("should not apply filters when cancel is clicked", async ({ page }) => {
    // Get the initial first row text for comparison
    const initialPlate = await searchPage.getFirstRowColumnText(2);

    await searchPage.openAdvancedFilters();

    // Set a very specific filter that would change results
    await searchPage.selectViolationStatuses(["Invalid"]);

    // Cancel instead of applying
    await searchPage.cancelAdvancedFilters();

    // Results should be unchanged - same first row plate
    const afterPlate = await searchPage.getFirstRowColumnText(2);
    expect(afterPlate).toBe(initialPlate);
  });
});

test.describe("Approve Functionality", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(searchPage.pageHeader).toBeVisible();
  });

  test("should approve a voided violation after confirming MRRES details", async () => {
    const found = await searchPage.filterAndOpenFirstViolation("VOID");

    if (!found) {
      test.skip(
        true,
        "No violation with status 'VOID' found to test approve functionality"
      );
      return;
    }

    await searchPage.clickApproveButton();

    const dialogPlate = (await searchPage.getApprovePlateNumber()).trim();
    const plateToCheck = dialogPlate || TEST_DATA["Plate Number"] || "ABC1234";
    const checkResult = await searchPage.checkMrresForApproval(plateToCheck);

    // The current UI disables the required LTO fields after the MRRES check,
    // so manual entry is only possible when the lookup succeeded.
    if (checkResult === "not_found") {
      test.skip(
        true,
        "MRRES returned 'Vehicle Not Found' — approval requires a valid LTO record"
      );
      return;
    }

    await searchPage.fillApproveRequiredFieldsIfEmpty({
      plateNumber: plateToCheck,
      mvFileNo: "023600000007284",
      fullName: "TEST, USER, T",
      ownerAddress: "TEST ADDRESS - APPROVAL FLOW",
    });

    await searchPage.confirmApproveAndSubmit();
  });
});
