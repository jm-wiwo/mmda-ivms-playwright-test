import { type Page, type Locator, expect } from "@playwright/test";

export class ValidationsPage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly validationTab: Locator;
  readonly approvalTab: Locator;
  readonly ticketTab: Locator;
  readonly rejectedTab: Locator;
  readonly archivedTab: Locator;
  readonly plateNumberInput: Locator;
  readonly violationInput: Locator;
  readonly updateButton: Locator;
  readonly rejectButton: Locator;
  readonly validateButton: Locator;
  readonly getIncidentButton: Locator;
  readonly moreDetailsAccordion: Locator;
  readonly detailsPlateNumberValue: Locator;
  readonly rejectionDialog: Locator;
  readonly rejectionSubmitButton: Locator;
  readonly rejectionMoreDetailsInput: Locator;
  readonly rejectionPlateNumberInput: Locator;
  readonly platePartiallyBlockedCheckbox: Locator;
  readonly plateNotVisibleCheckbox: Locator;
  readonly rejectionReasonLabels: Locator;
  readonly validationSuccessMessage: Locator;
  readonly rejectionSuccessMessage: Locator;
  readonly noIncidentsMessage: Locator;

  // --- Rejection Dialog Search ---
  readonly rejectionSearchInput: Locator;

  // --- Rejection Dialog Category Headings ---
  readonly rejectionCategoryHeadings: Locator;

  // --- Invalid Video Sub-options ---
  readonly invalidVideoSubOptions: Locator;

  // --- Others Textarea ---
  readonly othersDescriptionInput: Locator;
  readonly othersCharacterCounter: Locator;

  // --- Validation Confirmation Dialog ---
  readonly confirmValidationDialog: Locator;
  readonly confirmValidationTitle: Locator;
  readonly confirmValidationSubmitButton: Locator;
  readonly confirmValidationCancelButton: Locator;
  readonly confirmValidationPlateNo: Locator;
  readonly confirmValidationVehicleType: Locator;
  readonly confirmValidationViolation: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole("heading", { name: "INCIDENTS" });

    this.validationTab = page.getByRole("tab", { name: /VALIDATION/ });
    this.approvalTab = page.getByRole("tab", { name: /APPROVAL/ });
    this.ticketTab = page.getByRole("tab", { name: "TICKET" });
    this.rejectedTab = page.getByRole("tab", { name: "Rejected" });
    this.archivedTab = page.getByRole("tab", { name: "ARCHIVED" });

    const activeTabPanel = page.locator('div[role="tabpanel"]:not([hidden])');

    this.plateNumberInput = activeTabPanel.getByPlaceholder("Plate Number");
    this.violationInput = activeTabPanel.getByPlaceholder("Select violation");
    this.updateButton = activeTabPanel.getByRole("button", { name: "Update" });

    this.rejectButton = page.getByRole("button", { name: "Reject" });
    this.validateButton = page.getByRole("button", { name: "Validate" });
    this.getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for Validation",
    });
    this.moreDetailsAccordion = activeTabPanel
      .locator('[role="button"][aria-controls^="panel-content-"]')
      .filter({ hasText: "More Details" });

    this.detailsPlateNumberValue = page
      .locator("div")
      .filter({ hasText: /^Plate Number :$/ })
      .locator("+ div")
      .locator("p");

    this.rejectionDialog = page
      .getByRole("dialog")
      .filter({
        has: page.getByText(/Reject|Invalid/i),
      })
      .first();

    this.rejectionSubmitButton = this.rejectionDialog
      .getByRole("button", {
        name: /Reject|Invalidate|Submit/i,
      })
      .first();

    this.rejectionReasonLabels = this.rejectionDialog.locator(
      "label:has(input[type='radio'])"
    );
    this.rejectionMoreDetailsInput =
      this.rejectionDialog.getByLabel("Please describe the reason");
    // The Step 2 plate number input now uses placeholder "Plate Number"
    // (was "Enter plate number"). Match by name attribute to be resilient.
    this.rejectionPlateNumberInput = this.rejectionDialog.locator(
      'input[name="plate_number"]'
    );
    this.platePartiallyBlockedCheckbox = this.rejectionDialog.getByLabel(
      "Plate Number Partially Blocked"
    );
    this.plateNotVisibleCheckbox = this.rejectionDialog.getByLabel(
      "Plate Number Not Visible"
    );

    // --- Rejection Dialog Search ---
    this.rejectionSearchInput = this.rejectionDialog.getByRole("textbox", {
      name: /Search reason/i,
    });

    // --- Rejection Dialog Category Headings ---
    this.rejectionCategoryHeadings = this.rejectionDialog.locator(
      'h6, h5, h4, [class*="heading"], [class*="category"]'
    );

    // --- Invalid Video Sub-options ---
    this.invalidVideoSubOptions = this.rejectionDialog.locator(
      "label:has(input[type='radio'])"
    ).filter({
      hasText: /partially blocked|not visible|not coding|seatbelt observed/i,
    });

    // --- Others Textarea ---
    this.othersDescriptionInput = this.rejectionDialog.getByLabel(
      "Please describe the reason"
    );
    this.othersCharacterCounter = this.rejectionDialog.getByText(
      /\d+\s*\/\s*\d+ characters minimum/i
    );

    // --- Validation Confirmation Dialog ---
    this.confirmValidationDialog = page.getByRole("dialog").filter({
      has: page.getByRole("heading", { name: "Confirm Validation" }),
    });
    this.confirmValidationTitle = this.confirmValidationDialog.getByRole(
      "heading",
      { name: "Confirm Validation" }
    );
    // Submit button is now "YES" (was "Validate"). Cancel is now "No" (was "Cancel").
    this.confirmValidationSubmitButton =
      this.confirmValidationDialog.getByRole("button", {
        name: /^YES$/i,
      });
    this.confirmValidationCancelButton =
      this.confirmValidationDialog.getByRole("button", {
        name: /^No$/i,
      });
    this.confirmValidationPlateNo = this.confirmValidationDialog.getByText(
      /Plate No\./i
    );
    this.confirmValidationVehicleType =
      this.confirmValidationDialog.getByText(/Vehicle Type/i);
    this.confirmValidationViolation = this.confirmValidationDialog.getByText(
      /Violation/i
    );

    this.validationSuccessMessage = page
      .getByText("Successfully validated violation.")
      .last();
    // Validation view may show "invalidated" (button says "Invalidate") or
    // "rejected" (older wording). Accept both.
    this.rejectionSuccessMessage = page
      .getByText(/Successfully (rejected|invalidated) (violation|incident)\.?/i)
      .last();

    this.noIncidentsMessage = page.getByText(
      /No incidents found|No more incidents/i
    );
  }

  async navigate() {
    await this.page.goto("/violations/processing", {
      waitUntil: "domcontentloaded",
    });
    await expect(this.pageHeader).toBeVisible({ timeout: 15_000 });
    await expect(this.validationTab).toHaveAttribute("aria-selected", "true");
  }

  async clickApprovalTab() {
    await this.approvalTab.click();
  }

  async clickValidateButton() {
    await this.validateButton.click();
  }

  async getViolationOptions(): Promise<string[]> {
    await this.violationInput.click();
    const listbox = this.page
      .locator('div[role="presentation"] [role="listbox"]')
      .last();
    await listbox.waitFor({ timeout: 5000 });
    const optionTexts = (await listbox.getByRole("option").allTextContents())
      .map((text) => text.trim())
      .filter(Boolean)
      .filter((text) => text.toLowerCase() !== "no options");
    await this.page.keyboard.press("Escape");
    return Array.from(new Set(optionTexts));
  }

  async selectAndApplyViolation(violationName: string) {
    await this.violationInput.click();

    // Scope the option click to the visible listbox to avoid strict mode
    // violations when the same option name appears in multiple listboxes.
    const listbox = this.page
      .locator('div[role="presentation"] [role="listbox"]')
      .last();
    await listbox.waitFor({ state: "visible", timeout: 5_000 });
    await listbox
      .getByRole("option", { name: violationName, exact: true })
      .first()
      .click();

    // Violation type auto-updates on selection — no Update button click needed.
    // Wait for the dropdown to close before proceeding.
    await listbox
      .waitFor({ state: "hidden", timeout: 3_000 })
      .catch(() => {});
  }

  async updatePlateNumber(newPlateNumber: string) {
    await this.plateNumberInput.clear();
    await this.plateNumberInput.fill(newPlateNumber);

    await this.updateButton.click();

    // Wait for the success toast (MUI Snackbar with role="alert").
    await this.page
      .locator('[role="alert"]')
      .filter({ hasText: /updated/i })
      .waitFor({ state: "visible", timeout: 5_000 })
      .catch(() => {});

    await this.page.waitForTimeout(500);
  }

  async validateIncident() {
    await this.validateButton.click();
  }

  async openRejectionDialog() {
    if (!(await this.rejectionDialog.isVisible())) {
      await this.rejectButton.click();
      await expect(this.rejectionDialog).toBeVisible();
    }
  }

  async getRejectionReasons(): Promise<string[]> {
    if (!(await this.rejectionDialog.isVisible())) {
      await this.openRejectionDialog();
    }
    const labelsCount = await this.rejectionReasonLabels.count();
    const reasons: string[] = [];
    for (let i = 0; i < labelsCount; i++) {
      const text = (await this.rejectionReasonLabels.nth(i).innerText()).trim();
      if (text) {
        reasons.push(text);
      }
    }
    return reasons;
  }

  async selectReason(reason: string) {
    const reasonLocator = this.rejectionDialog.getByLabel(reason, {
      exact: false,
    });
    const isVisible = await reasonLocator.isVisible();
    if (!isVisible) {
      const available = await this.getRejectionReasons();
      throw new Error(
        `Rejection reason '${reason}' not found. Available reasons: ${available.join(
          ", "
        )}`
      );
    }
    await reasonLocator.check();
  }

  private async submitRejection() {
    await this.rejectionSubmitButton.click();
  }

  async rejectIncident(reasons: string | string[]) {
    await this.openRejectionDialog();
    const reasonsToCheck = Array.isArray(reasons) ? reasons : [reasons];
    for (const reason of reasonsToCheck) {
      await this.selectReason(reason);
    }
    await this.submitRejection();
  }

  async rejectIncidentWithDetails(options: {
    reason?: string;
    moreDetails?: string;
    plateNumber?: string;
    checkPartiallyBlocked?: boolean;
    checkNotVisible?: boolean;
    invalidVideoSubOption?: string;
  }) {
    await this.openRejectionDialog();

    // Select the rejection reason (use provided or fallback to first option)
    if (options.reason) {
      await this.selectReason(options.reason);
    } else {
      const reasons = await this.getRejectionReasons();
      if (!reasons.length) {
        throw new Error("No rejection reasons available to select.");
      }
      await this.selectReason(reasons[0]);
    }

    // If "Invalid Video" is chosen, auto-select a sub-option (now required).
    if (options.reason && /invalid video/i.test(options.reason)) {
      try {
        await this.invalidVideoSubOptions
          .first()
          .waitFor({ state: "visible", timeout: 3000 });
        if (options.invalidVideoSubOption) {
          await this.selectInvalidVideoSubOption(options.invalidVideoSubOption);
        } else {
          await this.invalidVideoSubOptions.first().click();
        }
      } catch {
        // Sub-options not shown — older UI flow.
      }
    }

    // Fill in more details if provided
    if (options.moreDetails) {
      try {
        await this.rejectionMoreDetailsInput.waitFor({
          state: "visible",
          timeout: 2000,
        });
        await this.rejectionMoreDetailsInput.fill(options.moreDetails);
      } catch {
        // Some rejection reasons do not expose the field; skip if absent.
      }
    }

    // Fill in plate number if provided and the field is available + enabled.
    // Some reasons (e.g., "Invalid Video" with sub-option) do not expose it.
    if (options.plateNumber) {
      try {
        await this.rejectionPlateNumberInput.waitFor({
          state: "visible",
          timeout: 3000,
        });
        if (await this.rejectionPlateNumberInput.isEnabled()) {
          await this.rejectionPlateNumberInput.fill(options.plateNumber);
        }
      } catch {
        // Plate number field not available for this rejection reason.
      }
    }

    // Check "Plate Number Partially Blocked" if requested
    if (options.checkPartiallyBlocked) {
      try {
        await this.platePartiallyBlockedCheckbox.waitFor({
          state: "visible",
          timeout: 3000,
        });
        await this.platePartiallyBlockedCheckbox.check();
      } catch {
        // Checkbox not available for this rejection reason.
      }
    }

    // Check "Plate Number Not Visible" if requested
    if (options.checkNotVisible) {
      try {
        await this.plateNotVisibleCheckbox.waitFor({
          state: "visible",
          timeout: 3000,
        });
        await this.plateNotVisibleCheckbox.check();
      } catch {
        // Checkbox not available for this rejection reason.
      }
    }

    await this.submitRejection();
  }

  // --- Rejection Dialog Search Methods ---

  async searchRejectionReason(keyword: string): Promise<void> {
    await this.openRejectionDialog();
    await this.rejectionSearchInput.waitFor({ state: "visible", timeout: 5_000 });
    await this.rejectionSearchInput.clear();
    await this.rejectionSearchInput.fill(keyword);
    // Allow time for search filtering and highlight animation
    await this.page.waitForTimeout(300);
  }

  async getHighlightedReasons(): Promise<string[]> {
    // Returns reason labels that have a non-default (highlighted) background style,
    // or that contain <mark> elements from search highlighting.
    const allLabels = this.rejectionDialog.locator("label:has(input[type='radio'])");
    // Also check for <mark> elements inside the dialog (some implementations use these)
    const markElements = this.rejectionDialog.locator("mark");
    const markCount = await markElements.count();
    if (markCount > 0) {
      const results: string[] = [];
      for (let i = 0; i < markCount; i++) {
        const text = (await markElements.nth(i).innerText()).trim();
        if (text) results.push(text);
      }
      return results;
    }

    // Fallback: check for non-default background colors on radio labels
    const count = await allLabels.count();
    const highlighted: string[] = [];
    for (let i = 0; i < count; i++) {
      const label = allLabels.nth(i);
      const bgColor = await label.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });
      // Accept any non-default background (not transparent, not white, not rgba(0,0,0,0))
      const isDefault =
        bgColor === "rgba(0, 0, 0, 0)" ||
        bgColor === "transparent" ||
        bgColor === "rgb(255, 255, 255)";
      if (!isDefault) {
        const text = (await label.innerText()).trim();
        if (text) highlighted.push(text);
      }
    }
    return highlighted;
  }

  // --- Invalid Video Sub-option Methods ---

  async selectInvalidVideoSubOption(subOption: string): Promise<void> {
    const subOptionLocator = this.rejectionDialog.getByLabel(subOption, {
      exact: false,
    });
    await expect(subOptionLocator).toBeVisible({ timeout: 5_000 });
    await subOptionLocator.check();
  }

  // --- Others Description Methods ---

  async fillOthersDescription(text: string): Promise<void> {
    await this.othersDescriptionInput.waitFor({
      state: "visible",
      timeout: 5_000,
    });
    await this.othersDescriptionInput.clear();
    await this.othersDescriptionInput.fill(text);
  }

  async getOthersCharacterCount(): Promise<string> {
    await this.othersCharacterCounter.waitFor({
      state: "visible",
      timeout: 5_000,
    });
    return (await this.othersCharacterCounter.innerText()).trim();
  }

  // --- Validation Confirmation Dialog Methods ---

  async waitForValidationConfirmDialog(): Promise<void> {
    await expect(this.confirmValidationDialog).toBeVisible({ timeout: 10_000 });
    await expect(this.confirmValidationTitle).toBeVisible();
  }

  async getConfirmationSummary(): Promise<{
    plateNo: string;
    vehicleType: string;
    violation: string;
  }> {
    await this.waitForValidationConfirmDialog();

    const plateNoText = await this.confirmValidationPlateNo.innerText();
    const vehicleTypeText = await this.confirmValidationVehicleType.innerText();
    const violationText = await this.confirmValidationViolation.innerText();

    // Extract the value portion after the label (e.g., "Plate No.: ABC 1234" → "ABC 1234")
    const extractValue = (text: string): string => {
      const parts = text.split(/:\s*/);
      return parts.length > 1 ? parts.slice(1).join(":").trim() : text.trim();
    };

    return {
      plateNo: extractValue(plateNoText),
      vehicleType: extractValue(vehicleTypeText),
      violation: extractValue(violationText),
    };
  }

  async waitForValidateButtonEnabled(): Promise<void> {
    // The Validate button starts disabled with a countdown timer (3, 2, 1, 0)
    // Wait until the button becomes enabled (countdown reaches 0)
    await expect(this.confirmValidationSubmitButton).toBeEnabled({
      timeout: 10_000,
    });
  }

  async confirmValidation(): Promise<void> {
    await this.waitForValidationConfirmDialog();
    await this.waitForValidateButtonEnabled();
    await this.confirmValidationSubmitButton.click();
  }

  async cancelValidation(): Promise<void> {
    await this.waitForValidationConfirmDialog();
    await this.confirmValidationCancelButton.click();
    // Wait for dialog to close
    await expect(this.confirmValidationDialog).toBeHidden({ timeout: 5_000 });
  }
}
