import { type Page, type Locator, expect } from "@playwright/test";

export type LtoData = {
  plateNumber: string;
  conductionNumber: string;
  mvFileNo: string;
  make: string;
  model: string;
  year: string;
  color: string;
  firstName: string;
  lastName: string;
  address: string;
};

export class ApprovalsPage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly validationTab: Locator;
  readonly approvalTab: Locator;
  readonly ticketTab: Locator;
  readonly rejectedTab: Locator;
  readonly archivedTab: Locator;
  readonly rejectButton: Locator;
  readonly approveButton: Locator;
  readonly getIncidentButton: Locator;

  readonly editLtoRecordButton: Locator;
  readonly editLtoDialog: Locator;
  readonly ltoPlateNumberInput: Locator;
  readonly ltoConductionNumberInput: Locator;
  readonly ltoMvFileInput: Locator;
  readonly ltoMakeInput: Locator;
  readonly ltoModelInput: Locator;
  readonly ltoYearInput: Locator;
  readonly ltoColorInput: Locator;
  readonly ltoFirstNameInput: Locator;
  readonly ltoLastNameInput: Locator;
  readonly ltoAddressInput: Locator;
  readonly ltoMobileNoInput: Locator;
  readonly ltoEmailInput: Locator;
  readonly ltoSaveButton: Locator;
  readonly ltoCancelButton: Locator;

  readonly ltoCheckMrresButton: Locator;
  readonly ltoVehicleNotFoundMessage: Locator;
  readonly ltoPlateInput: Locator;

  readonly rejectionDialog: Locator;
  readonly rejectionSubmitButton: Locator;
  readonly rejectionMoreDetailsInput: Locator;
  readonly rejectionPlateNumberInput: Locator;
  readonly platePartiallyBlockedCheckbox: Locator;
  readonly plateNotVisibleCheckbox: Locator;
  readonly rejectionReasonLabels: Locator;

  // --- Rejection Dialog Search ---
  readonly rejectionSearchInput: Locator;

  // --- Rejection Dialog Category Headings ---
  readonly rejectionCategoryHeadings: Locator;

  // --- Invalid Video Sub-options ---
  readonly invalidVideoSubOptions: Locator;

  // --- Others Textarea ---
  readonly othersDescriptionInput: Locator;
  readonly othersCharacterCounter: Locator;

  readonly approvalSuccessMessage: Locator;
  readonly rejectionSuccessMessage: Locator;

  readonly incidentPlateNumberInput: Locator;
  readonly violationInput: Locator;
  readonly updateButton: Locator;

  readonly incidentViolatedAtText: Locator;
  readonly codingWarningDialog: Locator;
  readonly codingWarningCloseButton: Locator;
  readonly noIncidentsMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole("heading", { name: "INCIDENTS" });
    this.validationTab = page.getByRole("tab", { name: /VALIDATION/ });
    this.approvalTab = page.getByRole("tab", { name: /APPROVAL/ });
    this.ticketTab = page.getByRole("tab", { name: "TICKET" });
    this.rejectedTab = page.getByRole("tab", { name: "Rejected" });
    this.archivedTab = page.getByRole("tab", { name: "ARCHIVED" });
    this.rejectButton = page.getByRole("button", { name: "Reject" });
    this.approveButton = page.getByRole("button", { name: "Approve" });
    this.getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for",
    });
    this.editLtoRecordButton = page.getByRole("button", {
      name: "Edit LTO Record",
    });
    this.editLtoDialog = page.getByRole("dialog", { name: "Edit LTO Record" });

    this.ltoPlateNumberInput = this.editLtoDialog.getByLabel("Plate Number");
    this.ltoConductionNumberInput =
      this.editLtoDialog.getByLabel("Conduction Number");
    this.ltoMvFileInput = this.editLtoDialog.getByLabel("Mv File No");
    this.ltoMakeInput = this.editLtoDialog.getByLabel("Make");
    this.ltoModelInput = this.editLtoDialog.getByLabel("Model");
    this.ltoYearInput = this.editLtoDialog.getByLabel("Year");
    this.ltoColorInput = this.editLtoDialog.getByLabel("Color");
    this.ltoFirstNameInput = this.editLtoDialog.getByLabel("Owner First Name");
    this.ltoLastNameInput = this.editLtoDialog.getByLabel("Owner Last Name");
    this.ltoAddressInput = this.editLtoDialog.getByLabel("Owner Address");
    this.ltoMobileNoInput = this.editLtoDialog.getByLabel("Mobile No");
    this.ltoEmailInput = this.editLtoDialog.getByLabel("Email Address");
    this.ltoSaveButton = this.editLtoDialog.getByRole("button", {
      name: "Save",
    });
    this.ltoCancelButton = this.editLtoDialog.getByRole("button", {
      name: "Cancel",
    });

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
      "label:has(input[type='checkbox']), label:has(input[type='radio'])"
    );
    this.rejectionMoreDetailsInput =
      this.rejectionDialog.getByLabel("More Details");
    // Placeholder varies ("Plate number" / "Plate Number" / "Enter plate number");
    // match by name attribute to be resilient.
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
    this.rejectionCategoryHeadings = this.rejectionDialog.getByRole("heading");

    // --- Invalid Video Sub-options ---
    this.invalidVideoSubOptions = this.rejectionDialog.locator(
      "label:has(input[type='radio'])"
    ).filter({
      hasText: /Plate number partially blocked|Plate Number Not Visible|Plate not coding|Seatbelt observed upon review/i,
    });

    // --- Others Textarea ---
    this.othersDescriptionInput = this.rejectionDialog.getByLabel(
      /Please describe the reason/i
    );
    this.othersCharacterCounter = this.rejectionDialog.getByText(
      /\d+\s*\/\s*\d+ characters minimum/i
    );

    this.approvalSuccessMessage = page
      .getByText("Successfully approved violation.")
      .last();
    // Approval view may show either "rejected" or "invalidated" depending on
    // the release; accept both wordings.
    this.rejectionSuccessMessage = page
      .getByText(/Successfully (rejected|invalidated) (violation|incident)\.?/i)
      .last();

    const activeTabPanel = page.locator('div[role="tabpanel"]:not([hidden])');

    this.ltoCheckMrresButton = activeTabPanel.getByRole("button", {
      name: "Check MRRES",
    });
    this.ltoVehicleNotFoundMessage = page
      .getByText("Vehicle Not Found.")
      .or(page.getByText("Errored while calling LTO API."));
    this.ltoPlateInput = activeTabPanel.locator(
      'input[name="lto_record$plate_number"]'
    );

    // Locate incident record elements directly within the active tab panel.
    // The approval page may not wrap these in a <form> element, so avoid
    // scoping via form:has(...) which fails when no <form> exists.
    this.incidentPlateNumberInput = activeTabPanel.locator(
      'input[name="plate_number"]'
    );
    this.violationInput =
      activeTabPanel.getByPlaceholder("Select violation");
    this.updateButton = activeTabPanel.getByRole("button", {
      name: "Update",
    });

    // --- UPDATED SECTION ---
    // Finds the "Violated At" field — scoped to active tab panel for accuracy
    this.incidentViolatedAtText = activeTabPanel
      .getByText(/Violated At\s*:/)
      .locator("..")
      .locator("+ div")
      .locator("p");

    // Finds the coding warning dialog — case-insensitive heading match
    this.codingWarningDialog = this.page.getByRole("dialog").filter({
      has: this.page.getByRole("heading", { name: /warning/i }),
    });
    this.codingWarningCloseButton = this.codingWarningDialog.getByRole(
      "button",
      { name: /close/i }
    );

    this.noIncidentsMessage = page.getByText(
      /No incidents found|No more incidents|Job in approval not found/i
    );
    // -------------------------------
  }

  async navigate() {
    await this.page.goto("/violations/processing", {
      waitUntil: "domcontentloaded",
    });
    await expect(this.pageHeader).toBeVisible({ timeout: 15_000 });
    await this.approvalTab.click();
  }

  private async _fillAndSaveLtoDialog(ltoData: LtoData) {
    await this.ltoPlateNumberInput.fill(ltoData.plateNumber);
    await this.ltoConductionNumberInput.fill(ltoData.conductionNumber);
    await this.ltoMvFileInput.fill(ltoData.mvFileNo);
    await this.ltoMakeInput.fill(ltoData.make);
    await this.ltoModelInput.fill(ltoData.model);
    await this.ltoYearInput.fill(ltoData.year);
    await this.ltoColorInput.fill(ltoData.color);
    await this.ltoFirstNameInput.fill(ltoData.firstName);
    await this.ltoLastNameInput.fill(ltoData.lastName);
    await this.ltoAddressInput.fill(ltoData.address);
    // Leave phone/email blank by design.

    await this.ltoSaveButton.click();
    await expect(this.editLtoDialog).not.toBeVisible();
  }

  async editLtoRecord(ltoData: LtoData) {
    await this.editLtoRecordButton.click();
    await expect(this.editLtoDialog).toBeVisible();
    await this._fillAndSaveLtoDialog(ltoData);
  }

  async verifyLtoRecordField(label: string, expectedValue: string) {
    console.log(`Verifying that '${label}' is '${expectedValue}'`);
    const labelRegex = new RegExp(`${label}\\s*:`);
    const fieldValueLocator = this.page
      .getByText(labelRegex)
      .locator("..")
      .locator("+ div")
      .locator("p");

    await expect(fieldValueLocator).toHaveText(expectedValue);
  }

  async populateRequiredLtoFieldsIfNeeded(fullLtoData: LtoData) {
    await this.editLtoRecordButton.click();
    await expect(this.editLtoDialog).toBeVisible();

    const mvFile = await this.ltoMvFileInput.inputValue();
    const firstName = await this.ltoFirstNameInput.inputValue();
    const lastName = await this.ltoLastNameInput.inputValue();

    if (!mvFile.trim() || !firstName.trim() || !lastName.trim()) {
      console.log(
        "Required LTO fields are missing inside the dialog. Populating..."
      );
      await this._fillAndSaveLtoDialog(fullLtoData);
    } else {
      console.log("Required LTO fields are already present. Closing dialog.");
      await this.page.keyboard.press("Escape");
      await expect(this.editLtoDialog).not.toBeVisible();
    }
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

  async approveIncident() {
    await this.approveButton.click();
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

  private async selectReason(reason: string) {
    await expect(this.rejectionReasonLabels.first()).toBeVisible({
      timeout: 5000,
    });
    const matchingLabel = this.rejectionReasonLabels
      .filter({ hasText: reason })
      .first();
    if ((await matchingLabel.count()) === 0) {
      const available = await this.getRejectionReasons();
      throw new Error(
        `Rejection reason '${reason}' not found. Available reasons: ${available.join(
          ", "
        )}`
      );
    }
    const input = matchingLabel.locator("input");
    if ((await input.count()) > 0) {
      await input.check();
    } else {
      await matchingLabel.click();
    }
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

    // Select the rejection reason
    if (options.reason) {
      await this.selectReason(options.reason);
    } else {
      const reasons = await this.getRejectionReasons();
      if (!reasons.length) {
        throw new Error("No rejection reasons available to select.");
      }
      await this.selectReason(reasons[0]);
    }

    // If reason is "Invalid Video", a sub-option is required before submission.
    // Auto-select the first sub-option if none specified.
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

    // Fill in plate number if provided and the field is enabled
    if (options.plateNumber) {
      try {
        await this.rejectionPlateNumberInput.waitFor({
          state: "visible",
          timeout: 5000,
        });
        // Some rejection reasons disable the plate number field
        if (await this.rejectionPlateNumberInput.isEnabled()) {
          await this.rejectionPlateNumberInput.fill(options.plateNumber);
        }
      } catch {
        // Plate number field not available for this rejection reason
      }
    }

    // Check "Plate Number Partially Blocked" if requested
    if (options.checkPartiallyBlocked) {
      try {
        await this.platePartiallyBlockedCheckbox.waitFor({
          state: "visible",
          timeout: 5000,
        });
        if (await this.platePartiallyBlockedCheckbox.isEnabled()) {
          await this.platePartiallyBlockedCheckbox.check();
        }
      } catch {
        // Checkbox not available for this rejection reason
      }
    }

    // Check "Plate Number Not Visible" if requested
    if (options.checkNotVisible) {
      try {
        await this.plateNotVisibleCheckbox.waitFor({
          state: "visible",
          timeout: 5000,
        });
        if (await this.plateNotVisibleCheckbox.isEnabled()) {
          await this.plateNotVisibleCheckbox.check();
        }
      } catch {
        // Checkbox not available for this rejection reason
      }
    }

    await this.submitRejection();
  }

  async checkMrresForPlate(
    plateNumber: string
  ): Promise<"found" | "not_found"> {
    console.log(`Filling incident plate number input with: ${plateNumber}`);
    await this.ltoPlateInput.fill(plateNumber);

    console.log("Clicking 'Check MRRES' button");
    await this.ltoCheckMrresButton.click();

    // The page shows a "Checking MRRES record…" loading indicator while the
    // API call is in progress.  We MUST wait for it to disappear before
    // inspecting results, otherwise stale LTO data from a previous check
    // may still be displayed and cause a false "found" result.
    const loadingIndicator = this.page.getByText(/Checking MRRES record/i);
    try {
      await loadingIndicator.waitFor({ state: "visible", timeout: 5_000 });
    } catch {
      // Loading indicator may have appeared and disappeared very quickly
    }
    await loadingIndicator.waitFor({ state: "hidden", timeout: 15_000 });

    // Check for "not found" / error outcomes first
    if (await this.ltoVehicleNotFoundMessage.isVisible()) {
      console.log(
        `MRRES Check: 'Vehicle not found' / error message appeared for plate ${plateNumber}.`
      );
      return "not_found";
    }

    // If no error message, check if vehicle data was populated
    const makeFieldLocator = this.page
      .getByText(/Make\s*:/)
      .locator("..")
      .locator("+ div")
      .locator("p");
    const makeText = await makeFieldLocator.textContent();
    if (
      makeText &&
      makeText.trim() !== "" &&
      makeText.trim() !== "N/A" &&
      makeText.trim() !== "-"
    ) {
      console.log(
        `MRRES Check: Vehicle data was populated for plate ${plateNumber}.`
      );
      return "found";
    }

    throw new Error(
      `MRRES check for plate ${plateNumber} completed without a clear result.`
    );
  }

  async getViolatedAt(): Promise<string> {
    // Strategy 1: Label-sibling approach (primary locator)
    try {
      await this.incidentViolatedAtText.waitFor({
        state: "visible",
        timeout: 5_000,
      });
      const text = await this.incidentViolatedAtText.textContent();
      if (text && text.trim()) {
        console.log(
          `getViolatedAt (label-sibling locator): '${text.trim()}'`
        );
        return text.trim();
      }
    } catch {
      console.log(
        "getViolatedAt: primary locator (label-sibling) did not match."
      );
    }

    // Strategy 2: Search the active tab panel for a "Violated At" label
    // and extract the value from the closest container text
    const activeTabPanel = this.page.locator(
      'div[role="tabpanel"]:not([hidden])'
    );
    try {
      const violatedAtLabel = activeTabPanel
        .getByText(/Violated At/i)
        .first();
      await violatedAtLabel.waitFor({ state: "visible", timeout: 3_000 });
      // Walk up to the nearest common parent and look for a date-like text
      const container = violatedAtLabel.locator(
        "xpath=ancestor::div[1]/following-sibling::div[1]"
      );
      const containerText = await container.textContent({ timeout: 3_000 });
      if (containerText && containerText.trim()) {
        console.log(
          `getViolatedAt (xpath ancestor fallback): '${containerText.trim()}'`
        );
        return containerText.trim();
      }
    } catch {
      console.log("getViolatedAt: xpath ancestor fallback did not match.");
    }

    // Strategy 3: Pattern-match a date string that follows "Violated At"
    // anywhere in the tab panel text
    try {
      const panelText = await activeTabPanel.textContent({ timeout: 3_000 });
      const violatedAtMatch = panelText?.match(
        /Violated At\s*:?\s*([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4},\s+\d{2}:\d{2}:\d{2}\s+[AP]M)/i
      );
      if (violatedAtMatch?.[1]) {
        console.log(
          `getViolatedAt (regex fallback): '${violatedAtMatch[1].trim()}'`
        );
        return violatedAtMatch[1].trim();
      }
    } catch {
      console.log("getViolatedAt: regex fallback did not match.");
    }

    console.log(
      "getViolatedAt: all strategies failed — returning empty string"
    );
    return "";
  }

  /**
   * Clicks Approve and waits for either the coding warning dialog, the
   * approval success message, or any other dialog to appear.
   * Returns the detected outcome so callers can branch accordingly.
   */
  async approveAndDetectOutcome(
    timeoutMs = 15_000
  ): Promise<"coding_warning" | "approved" | "other_dialog" | "timeout"> {
    await this.approveButton.click();

    const result = await Promise.race([
      this.codingWarningDialog
        .waitFor({ state: "visible", timeout: timeoutMs })
        .then(() => "coding_warning" as const),
      this.approvalSuccessMessage
        .waitFor({ state: "visible", timeout: timeoutMs })
        .then(() => "approved" as const),
    ]).catch(() => "timeout" as const);

    // If we got a timeout, check whether some OTHER dialog appeared instead
    if (result === "timeout") {
      const anyDialog = this.page.getByRole("dialog");
      if (await anyDialog.first().isVisible()) {
        const dialogText = await anyDialog.first().textContent();
        console.log(
          `approveAndDetectOutcome: unexpected dialog appeared — "${dialogText?.substring(0, 200)}"`
        );
        return "other_dialog";
      }
    }

    return result;
  }

  async closeCodingWarningDialog() {
    await this.codingWarningCloseButton.click();
    await expect(this.codingWarningDialog).not.toBeVisible();
  }

  async cancelLtoEdit() {
    await this.ltoCancelButton.click();
    await expect(this.editLtoDialog).not.toBeVisible();
  }

  async clearLtoFields() {
    await this.ltoMvFileInput.clear();
    await this.ltoFirstNameInput.clear();
    await this.ltoLastNameInput.clear();
  }

  /**
   * Searches for a rejection reason in the rejection dialog search box.
   * Opens the rejection dialog first if it is not already visible.
   */
  async searchRejectionReason(keyword: string): Promise<void> {
    await this.openRejectionDialog();
    await this.rejectionSearchInput.waitFor({ state: "visible", timeout: 5_000 });
    await this.rejectionSearchInput.fill(keyword);
  }

  /**
   * Returns the text content of all highlighted (matched) rejection reasons
   * after a search keyword has been entered. Looks for <mark> elements which
   * are the standard way browsers render search highlighting.
   */
  async getHighlightedReasons(): Promise<string[]> {
    const marks = this.rejectionDialog.locator("mark");
    await marks.first().waitFor({ state: "visible", timeout: 5_000 });
    const count = await marks.count();
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await marks.nth(i).textContent())?.trim();
      if (text) {
        results.push(text);
      }
    }
    return results;
  }

  /**
   * Selects a sub-option radio button that appears after choosing "INVALID VIDEO".
   * Expects the INVALID VIDEO reason to already be selected and the sub-options
   * to be visible.
   */
  async selectInvalidVideoSubOption(subOption: string): Promise<void> {
    const subOptionLabel = this.rejectionDialog
      .locator("label:has(input[type='radio'])")
      .filter({ hasText: subOption })
      .first();

    if ((await subOptionLabel.count()) === 0) {
      const available = await this.invalidVideoSubOptions.allTextContents();
      throw new Error(
        `Invalid Video sub-option '${subOption}' not found. Available: ${available
          .map((t) => t.trim())
          .join(", ")}`
      );
    }

    const input = subOptionLabel.locator("input");
    if ((await input.count()) > 0) {
      await input.check();
    } else {
      await subOptionLabel.click();
    }
  }

  /**
   * Fills the "Please describe the reason" textarea that appears when the
   * "OTHERS" rejection reason is selected.
   */
  async fillOthersDescription(text: string): Promise<void> {
    await this.othersDescriptionInput.waitFor({
      state: "visible",
      timeout: 5_000,
    });
    await this.othersDescriptionInput.fill(text);
  }

  /**
   * Returns the current character counter text displayed below the "OTHERS"
   * description textarea (e.g. "15 / 30 characters minimum").
   */
  async getOthersCharacterCount(): Promise<string> {
    await this.othersCharacterCounter.waitFor({
      state: "visible",
      timeout: 5_000,
    });
    const text = await this.othersCharacterCounter.textContent();
    return (text ?? "").trim();
  }
}
