import { type Page, type Locator, expect } from "@playwright/test";

export type SearchParameter =
  | "Plate Number"
  | "Ticket Number"
  | "ID"
  | "Camera ID";

export class SearchPage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly parameterDropdown: Locator;
  readonly searchButton: Locator;
  readonly resultsTable: Locator;
  readonly resultsTableBody: Locator;
  readonly mainContent: Locator;
  readonly voidButton: Locator;
  readonly exemptButton: Locator;
  readonly approveButton: Locator;
  readonly approveDialog: Locator;
  readonly approveCheckMrresButton: Locator;
  readonly approveVehicleNotFoundMessage: Locator;
  readonly approvePlateNumberInput: Locator;
  readonly approveMvFileInput: Locator;
  readonly approveFullNameInput: Locator;
  readonly approveOwnerAddressInput: Locator;
  readonly approveConfirmCheckbox: Locator;
  readonly approveSubmitButton: Locator;
  readonly reasonTextarea: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly violationStatusBadge: Locator;

  // --- Advanced Filters Dialog ---
  readonly advancedFiltersButton: Locator;
  readonly advancedFiltersDialog: Locator;
  readonly violationStatusCombobox: Locator;
  readonly ticketsApprovedByCombobox: Locator;
  readonly validatedByCombobox: Locator;
  readonly exactMatchSearchByCombobox: Locator;
  readonly exactMatchValueInput: Locator;
  readonly exactMatchAddAnotherButton: Locator;
  readonly dateFieldCombobox: Locator;
  readonly dateSingleButton: Locator;
  readonly dateRangeButton: Locator;
  readonly dateOnOrAfterInput: Locator;
  readonly clearAllFiltersButton: Locator;
  readonly applyFiltersButton: Locator;
  readonly resetFiltersButton: Locator;
  readonly cancelFiltersButton: Locator;
  readonly saveViewButton: Locator;
  readonly noFiltersMessage: Locator;
  readonly activeFiltersCount: Locator;
  readonly activeFiltersList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole("heading", {
      name: "VIOLATION SEARCHING AND VIEWING",
    });

    this.parameterDropdown = page.locator(
      'div.MuiSelect-select.MuiSelect-outlined[aria-haspopup="listbox"]'
    );

    this.searchButton = page.getByRole("button", { name: "Search" });

    this.resultsTable = page.getByRole("table");

    this.resultsTableBody = this.resultsTable.locator("tbody");

    this.mainContent = page.locator("main.layout-page-content");

    this.voidButton = page.getByRole("button", { name: "VOID" });
    this.exemptButton = page.getByRole("button", { name: "EXEMPT" });
    this.approveButton = page.getByRole("button", {
      name: "Approve",
      exact: true,
    });
    this.approveDialog = page.getByRole("dialog").filter({
      has: page.getByText(
        "Review and verify LTO information before reprocessing."
      ),
    });
    this.approveCheckMrresButton = this.approveDialog.getByRole("button", {
      name: "Check MRRES",
    });
    this.approveVehicleNotFoundMessage = this.page
      .getByText("Errored while calling LTO API.")
      .or(page.getByText("Vehicle Not Found."));
    this.approvePlateNumberInput = this.approveDialog.locator(
      'input[name="lto_record$plate_number"]'
    );
    this.approveMvFileInput = this.approveDialog.locator(
      'input[name="lto_record$mv_file_no"]'
    );
    this.approveFullNameInput = this.approveDialog.locator(
      'input[name="lto_record$full_name"]'
    );
    this.approveOwnerAddressInput = this.approveDialog.locator(
      'input[name="lto_record$owner_address"]'
    );
    this.approveConfirmCheckbox = this.approveDialog.getByRole("checkbox", {
      name: "I confirm the MRRES check succeeded and details are accurate.",
    });
    this.approveSubmitButton = this.approveDialog.getByRole("button", {
      name: "Submit",
    });
    this.reasonTextarea = page.locator(
      "textarea:not([readonly]):not([aria-hidden='true'])"
    );
    this.confirmButton = page.getByRole("button", { name: "Submit" });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.successMessage = page.locator(".MuiAlert-message, .success-message");
    this.violationStatusBadge = page.locator(
      'span[class*="MuiBadge"], .status-badge'
    );

    // --- Advanced Filters Dialog locators ---
    this.advancedFiltersButton = page.getByRole("button", {
      name: "Advanced filters",
    });
    this.advancedFiltersDialog = page.getByRole("dialog").filter({
      has: page.getByRole("heading", { name: "Advanced Filters", level: 6 }),
    });
    this.violationStatusCombobox =
      this.advancedFiltersDialog.getByRole("combobox", {
        name: "Violation Status",
      });
    this.ticketsApprovedByCombobox =
      this.advancedFiltersDialog.getByRole("combobox", {
        name: "Tickets Approved By",
      });
    this.validatedByCombobox =
      this.advancedFiltersDialog.getByRole("combobox", {
        name: "Validated By",
      });
    this.exactMatchSearchByCombobox =
      this.advancedFiltersDialog.getByRole("combobox", {
        name: "Search by",
      });
    this.exactMatchValueInput =
      this.advancedFiltersDialog.getByRole("textbox", {
        name: "Enter value",
      });
    this.exactMatchAddAnotherButton =
      this.advancedFiltersDialog.getByRole("button", {
        name: "Add another",
      });
    this.dateFieldCombobox =
      this.advancedFiltersDialog.getByRole("combobox", {
        name: "Date field",
      });
    this.dateSingleButton = this.advancedFiltersDialog.getByRole("button", {
      name: "Single",
    });
    this.dateRangeButton = this.advancedFiltersDialog.getByRole("button", {
      name: "Range",
    });
    this.dateOnOrAfterInput =
      this.advancedFiltersDialog.getByRole("textbox", {
        name: "On or after",
      });
    this.clearAllFiltersButton =
      this.advancedFiltersDialog.getByRole("button", {
        name: "Clear all",
      });
    this.applyFiltersButton =
      this.advancedFiltersDialog.getByRole("button", {
        name: "Apply Filters",
      });
    this.resetFiltersButton =
      this.advancedFiltersDialog.getByRole("button", {
        name: "Reset",
      });
    this.cancelFiltersButton =
      this.advancedFiltersDialog.getByRole("button", {
        name: "Cancel",
      });
    this.saveViewButton = this.advancedFiltersDialog.getByRole("button", {
      name: "Save View",
    });
    this.noFiltersMessage = this.advancedFiltersDialog.getByText(
      "No filters selected."
    );
    this.activeFiltersCount = this.advancedFiltersDialog.locator(
      '.MuiChip-label'
    ).filter({ hasText: /active/ });
    this.activeFiltersList = this.advancedFiltersDialog.locator(
      '.MuiPaper-root'
    ).filter({ has: page.getByText("Active Filters") });
  }

  /**
   * @param parameter The search parameter being used (e.g., "Plate Number")
   * @returns A Locator for the correct search input field.
   */
  private getSearchInput(parameter: SearchParameter): Locator {
    let placeholderText = "";

    if (parameter === "ID") {
      placeholderText = "Search  Id";
    } else {
      placeholderText = `Search ${parameter}`;
    }

    return this.page.getByPlaceholder(placeholderText);
  }

  async navigate() {
    await this.page.goto("/violations/search", { waitUntil: "networkidle" });

    await expect(this.pageHeader).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /**
   * @param parameter The search parameter to use (e.g., "Plate Number")
   * @param value The value to search for (e.g., "ABC1234")
   */
  async searchBy(parameter: SearchParameter, value: string) {
    if (parameter !== "Plate Number") {
      await this.parameterDropdown.click();
      await this.page
        .getByRole("option", { name: parameter, exact: true })
        .click();
    }

    const searchInput = this.getSearchInput(parameter);

    await searchInput.fill(value);
    await this.searchButton.click();

    // Wait for results to appear; may time out if no matches exist
    try {
      await this.resultsTableBody.locator("tr").first().waitFor({
        state: "visible",
        timeout: 10_000,
      });
    } catch {
      // No results returned — this is acceptable for some test scenarios
    }
  }

  /**
   * @param value The value to check for (e.g., "ABC1234")
   */
  async verifySearchResult(parameter: SearchParameter, value: string) {
    const row = this.resultsTableBody.locator("tr").first();

    const viewButton = row.getByRole("button", { name: "View" });

    // Scroll the table horizontally to make the View button visible
    await this.resultsTable.evaluate((table) => {
      table.scrollLeft = table.scrollWidth;
    });

    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.click();

    if (parameter === "Ticket Number") {
      // Ticket Number is rendered inside a <b> tag at the top of the details view.
      await expect(
        this.mainContent.locator("b").getByText(value, { exact: true })
      ).toBeVisible();
    } else if (parameter === "Plate Number") {
      // The plate number appears in the selected tab label (the Vehicle Record
      // section renders the plate with spaces between characters which breaks
      // exact matching).
      await expect(
        this.mainContent.getByRole("tab", { selected: true }).filter({
          hasText: value,
        })
      ).toBeVisible();
    } else {
      // ID / Camera ID — look for the value in a <p> tag within the details view.
      await expect(
        this.mainContent.locator("p").getByText(value, { exact: true }).first()
      ).toBeVisible();
    }
  }

  /**
   * Clicks the VOID button on the violation details view
   */
  async clickVoidButton() {
    await this.voidButton.scrollIntoViewIfNeeded();
    await this.voidButton.click();
  }

  /**
   * Clicks the EXEMPT button on the violation details view
   */
  async clickExemptButton() {
    await this.exemptButton.scrollIntoViewIfNeeded();
    await this.exemptButton.click();
  }

  /**
   * Clicks the APPROVE button on the violation details view
   */
  async clickApproveButton() {
    await this.approveButton.scrollIntoViewIfNeeded();
    await this.approveButton.click();
    await expect(this.approveDialog).toBeVisible();
  }

  /**
   * Fills in the reason textarea for void action
   * @param reason - The reason text to enter
   */
  async fillVoidReason(reason: string) {
    await this.reasonTextarea.waitFor({ state: "visible" });
    await this.reasonTextarea.fill(reason);
  }

  /**
   * Confirms the void/exempt action by clicking the Confirm button
   */
  async confirmAction() {
    await this.confirmButton.waitFor({ state: "visible" });
    await this.confirmButton.click();
  }

  /**
   * Cancels the void/exempt action by clicking the Cancel button
   */
  async cancelAction() {
    await this.cancelButton.waitFor({ state: "visible" });
    await this.cancelButton.click();
  }

  /**
   * Verifies that a success message is displayed
   */
  async verifySuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Searches for a violation by ID and verifies the status
   * @param violationId - The violation ID to search for
   * @param expectedStatus - Expected status (e.g., "VOIDED", "EXEMPTED")
   */
  async verifyViolationStatus(violationId: string, expectedStatus: string) {
    // Navigate back to search page
    await this.navigate();

    // Search by ID
    await this.searchBy("ID", violationId);

    // Click View on the first result
    const row = this.resultsTableBody.locator("tr").first();
    const viewButton = row.getByRole("button", { name: "View" });
    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.click();

    // Verify the status appears in the violation details
    await expect(
      this.mainContent.getByText(expectedStatus, { exact: false })
    ).toBeVisible();
  }

  /**
   * Opens the Advanced Filters dialog.
   */
  async openAdvancedFilters() {
    await this.advancedFiltersButton.click();
    await expect(this.advancedFiltersDialog).toBeVisible();
  }

  /**
   * Removes all currently selected Violation Status chips,
   * then selects only the specified statuses.
   * Must be called while the Advanced Filters dialog is open.
   * @param statuses One or more status labels to select (e.g., "Approved", "Void")
   */
  async selectViolationStatuses(statuses: string[]) {
    // Remove all existing status chips by clicking their close (x) buttons
    const existingChips = this.advancedFiltersDialog
      .locator('[class*="MuiChip"]')
      .filter({ has: this.page.locator('svg[data-testid="CancelIcon"], [class*="deleteIcon"]') });

    // Try clicking x buttons on each chip; the chips are the buttons with names like "Approved", "Validated" etc.
    const statusChipNames = ["Approved", "Validated", "Void", "Invalid"];
    for (const chipName of statusChipNames) {
      const chipButton = this.advancedFiltersDialog.getByRole("button", {
        name: chipName,
        exact: true,
      });
      if (await chipButton.isVisible()) {
        // Click the x icon inside the chip to remove it
        await chipButton.locator("img, svg").last().click();
      }
    }

    // Now add each desired status via the combobox
    for (const status of statuses) {
      await this.violationStatusCombobox.click();
      await this.violationStatusCombobox.fill(status);
      const option = this.page.getByRole("option", {
        name: status,
        exact: true,
      });
      await option.waitFor({ state: "visible" });
      await option.click();
    }
  }

  /**
   * Sets an exact match filter in the Advanced Filters dialog.
   * Must be called while the dialog is open.
   * @param field The field to match (e.g., "Plate Number", "Ticket Number")
   * @param value The value to match
   */
  async setExactMatchFilter(field: string, value: string) {
    // Select the field in the "Search by" combobox
    await this.exactMatchSearchByCombobox.click();
    const fieldOption = this.page.getByRole("option", {
      name: field,
      exact: true,
    });
    await fieldOption.waitFor({ state: "visible" });
    await fieldOption.click();

    // Enter the value
    await this.exactMatchValueInput.fill(value);
  }

  /**
   * Applies the current advanced filters and waits for the dialog to close.
   * The results table may or may not appear depending on whether results exist.
   */
  async applyAdvancedFilters() {
    await this.applyFiltersButton.click();
    // Wait for dialog to close
    await this.advancedFiltersDialog.waitFor({ state: "hidden", timeout: 10_000 });
    // Wait for either the results table to appear or a brief timeout for empty results
    try {
      await this.resultsTable.waitFor({ state: "visible", timeout: 15_000 });
    } catch {
      // No results returned — table may not be visible. This is acceptable.
    }
  }

  /**
   * Resets the advanced filters to defaults.
   * Must be called while the dialog is open.
   */
  async resetAdvancedFilters() {
    await this.resetFiltersButton.click();
  }

  /**
   * Cancels the advanced filters dialog without applying.
   */
  async cancelAdvancedFilters() {
    await this.cancelFiltersButton.click();
    await this.advancedFiltersDialog.waitFor({ state: "hidden", timeout: 5_000 });
  }

  /**
   * Clears all active filters in the dialog.
   * Must be called while the dialog is open.
   */
  async clearAllActiveFilters() {
    await this.clearAllFiltersButton.click();
  }

  /**
   * Sets the date field and mode in the Date Range section.
   * @param field The date field (e.g., "Created At", "Violated At")
   * @param mode "Single" or "Range"
   */
  async setDateFilter(field: string, mode: "Single" | "Range" = "Single") {
    await this.dateFieldCombobox.click();
    const fieldOption = this.page.getByRole("option", {
      name: field,
      exact: true,
    });
    await fieldOption.waitFor({ state: "visible" });
    await fieldOption.click();

    if (mode === "Single") {
      await this.dateSingleButton.click();
    } else {
      await this.dateRangeButton.click();
    }
  }

  /**
   * Gets the count of rows in the results table.
   * @returns Number of visible rows
   */
  async getResultsRowCount(): Promise<number> {
    try {
      await this.resultsTableBody.locator("tr").first().waitFor({
        state: "visible",
        timeout: 5_000,
      });
    } catch {
      return 0;
    }
    return this.resultsTableBody.locator("tr").count();
  }

  /**
   * Gets the text of a specific column in the first result row.
   * @param columnIndex Zero-based column index
   */
  async getFirstRowColumnText(columnIndex: number): Promise<string> {
    const firstRow = this.resultsTableBody.locator("tr").first();
    await firstRow.waitFor({ state: "visible" });
    const cell = firstRow.locator("td").nth(columnIndex);
    return (await cell.innerText()).trim();
  }

  /**
   * Collects the text from a specific column across all visible result rows.
   * Useful for gathering plate numbers (or other fields) from the current
   * result set so a random value can be picked for subsequent filter tests.
   * @param columnIndex Zero-based column index
   * @returns Array of non-empty trimmed cell texts
   */
  async getColumnTextsFromAllRows(columnIndex: number): Promise<string[]> {
    const rows = this.resultsTableBody.locator("tr");
    const count = await rows.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const cell = rows.nth(i).locator("td").nth(columnIndex);
      const text = (await cell.innerText()).trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  /**
   * Filters violations by status and opens the first result.
   * The filter dropdown labels differ from the table status text:
   *   Filter label "Approved"  -> table shows "APPROVED"
   *   Filter label "Validated" -> table shows "VIOLATION"
   *   Filter label "Void"      -> table shows "VOID"/"VOIDED"
   *   Filter label "Invalid"   -> table shows "INVALID"
   *
   * This method accepts either the table status or the filter label.
   * @param status The status (e.g., "APPROVED", "VIOLATION", "VOID", "Approved", "Validated")
   * @returns True if a violation was found and opened, false otherwise
   */
  async filterAndOpenFirstViolation(status: string): Promise<boolean> {
    await this.openAdvancedFilters();

    // Map table-displayed statuses to filter dropdown labels
    const STATUS_MAP: Record<string, string> = {
      APPROVED: "Approved",
      VIOLATION: "Validated",
      VOID: "Void",
      VOIDED: "Void",
      INVALID: "Invalid",
      EXEMPTED: "Exempted",
    };

    const upperStatus = status.toUpperCase();
    const filterLabel = STATUS_MAP[upperStatus] || status;

    await this.selectViolationStatuses([filterLabel]);
    await this.applyAdvancedFilters();

    const firstRow = this.resultsTableBody.locator("tr").first();
    try {
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    } catch {
      return false;
    }

    const viewButton = firstRow.getByRole("button", { name: "View" });

    await this.resultsTable.evaluate((table) => {
      table.scrollLeft = table.scrollWidth;
    });

    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.click();
    return true;
  }

  /**
   * Runs MRRES check for the approval dialog.
   * @param plateNumber The plate number to verify.
   */
  async checkMrresForApproval(
    plateNumber: string
  ): Promise<"found" | "not_found"> {
    await expect(this.approveDialog).toBeVisible();
    await this.approvePlateNumberInput.fill(plateNumber);
    await this.approveCheckMrresButton.click();

    try {
      await this.approveVehicleNotFoundMessage.waitFor({
        state: "visible",
        timeout: 10000,
      });
      return "not_found";
    } catch {
      return "found";
    }
  }

  /**
   * Ensures required LTO fields are populated before approving.
   */
  async fillApproveRequiredFieldsIfEmpty(data: {
    plateNumber: string;
    mvFileNo: string;
    fullName: string;
    ownerAddress: string;
  }) {
    await expect(this.approveDialog).toBeVisible();

    // Helper: fill only if the field is empty AND enabled. Fields may be
    // auto-populated by the MRRES check and rendered read-only.
    const fillIfEmptyAndEnabled = async (
      locator: Locator,
      value: string
    ): Promise<void> => {
      const current = await locator.inputValue();
      if (current.trim()) return;
      if (!(await locator.isEnabled())) return;
      await locator.fill(value);
    };

    await fillIfEmptyAndEnabled(this.approvePlateNumberInput, data.plateNumber);
    await fillIfEmptyAndEnabled(this.approveMvFileInput, data.mvFileNo);
    await fillIfEmptyAndEnabled(this.approveFullNameInput, data.fullName);
    await fillIfEmptyAndEnabled(this.approveOwnerAddressInput, data.ownerAddress);
  }

  async getApprovePlateNumber(): Promise<string> {
    await expect(this.approveDialog).toBeVisible();
    return this.approvePlateNumberInput.inputValue();
  }

  async confirmApproveAndSubmit() {
    await this.approveConfirmCheckbox.check();
    await expect(this.approveSubmitButton).toBeEnabled();
    await this.approveSubmitButton.click();
  }
}
