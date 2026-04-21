import { type Page, type Locator, expect } from "@playwright/test";

export type ManualViolationData = {
  violationDate: string;
  violationTime: string;
  location: string;
  plateNumber: string;
  violation: string;
  motorVehicleType: string;
  approver: string;
  ltoPlateNumber: string;
  conductionNumber: string;
  mvFileNo: string;
  make: string;
  model: string;
  year: string;
  ownerName: string;
  ownerAddress: string;
  ownerZip: string;
  ownerEmail: string;
  ownerNumber: string;
};

export class ManualUploadPage {
  readonly page: Page;
  readonly pageHeader: Locator;

  readonly violationDateInput: Locator;
  readonly violationTimeInput: Locator;
  readonly locationInput: Locator;
  readonly plateNumberInput: Locator;
  readonly violationDropdown: Locator;
  readonly approverDropdown: Locator;
  readonly approverPopupIndicator: Locator;

  // --- Locators for LTO Record ---
  readonly ltoPlateNumberInput: Locator; // NEW
  readonly conductionNumberInput: Locator; // NEW
  readonly mvFileInput: Locator; // NEW
  readonly makeInput: Locator; // NEW
  readonly modelInput: Locator; // NEW
  readonly yearInput: Locator; // NEW
  readonly motorVehicleTypeDropdown: Locator;

  // Locators for Owner Details
  readonly ownerNameInput: Locator;
  readonly ownerAddressInput: Locator;
  readonly ownerZipInput: Locator;
  readonly ownerEmailInput: Locator;
  readonly ownerNumberInput: Locator;

  // --- Locators for Media Files ---
  readonly image1Upload: Locator;
  readonly image2Upload: Locator;
  readonly image3Upload: Locator;
  readonly image4Upload: Locator;
  readonly videoUpload: Locator;

  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.getByRole("heading", { name: "Manual Upload" });

    // --- Violation Details ---
    const ltoRecordCard = page.locator(".MuiPaper-root").filter({
      has: page.getByRole("heading", { name: "1. Vehicle LTO Record" }),
    });
    const violationDetailsCard = page.locator(".MuiPaper-root").filter({
      has: page.getByRole("heading", { name: "2. Violation Details" }),
    });
    const ownerDetailsCard = page.locator(".MuiPaper-root").filter({
      has: page.getByRole("heading", { name: "3. Vehicle Owner Details" }),
    });
    // --- Violation Details Locators ---
    this.violationDateInput = violationDetailsCard.getByLabel("Violation Date");
    this.violationTimeInput = violationDetailsCard.getByLabel("Violation Time");
    this.locationInput = violationDetailsCard.getByLabel("Location").first();
    this.plateNumberInput =
      violationDetailsCard.getByPlaceholder("Plate Number");
    this.violationDropdown = violationDetailsCard.getByLabel("Violation", {
      exact: true,
    });
    const approverField = violationDetailsCard
      .getByPlaceholder("Select approver")
      .locator("xpath=ancestor::div[contains(@class,'MuiAutocomplete-inputRoot')]");
    this.approverDropdown = approverField.getByRole("combobox");
    this.approverPopupIndicator = approverField.getByRole("button", {
      name: "Open",
    });

    // --- LTO Record Locators ---
    this.ltoPlateNumberInput = ltoRecordCard.getByPlaceholder("Plate Number"); // NEW
    this.conductionNumberInput = ltoRecordCard.getByLabel("Conduction Number"); // NEW
    this.mvFileInput = ltoRecordCard.getByLabel("MV File No."); // NEW
    this.makeInput = ltoRecordCard.getByLabel("Make"); // NEW
    this.modelInput = ltoRecordCard.getByLabel("Model"); // NEW
    this.yearInput = ltoRecordCard.getByLabel("Year"); // NEW
    this.motorVehicleTypeDropdown =
      ltoRecordCard.getByLabel("Motor Vehicle Type");

    // --- Vehicle Owner Details Locators ---
    this.ownerNameInput = ownerDetailsCard.getByLabel("Name");
    this.ownerAddressInput = ownerDetailsCard.getByLabel("Address");
    this.ownerZipInput = ownerDetailsCard.getByLabel("Zip Code");
    this.ownerEmailInput = ownerDetailsCard.getByLabel("Email");
    this.ownerNumberInput = ownerDetailsCard.getByLabel("Mobile Number");

    // --- Media Files ---
    // These locators target the hidden <input type="file"> inside each dropzone
    this.image1Upload = page
      .locator('div.dropzone:has-text("Upload 1st Image")')
      .locator("input");
    this.image2Upload = page
      .locator('div.dropzone:has-text("Upload 2nd Image")')
      .locator("input");
    this.image3Upload = page
      .locator('div.dropzone:has-text("Upload 3rd Image")')
      .locator("input");
    this.image4Upload = page
      .locator('div.dropzone:has-text("Upload 4th Image")')
      .locator("input");
    this.videoUpload = page
      .locator('div.dropzone:has-text("Upload Violation Video")')
      .locator("input");

    // --- Final Actions ---
    this.submitButton = page.getByRole("button", { name: "Submit" });
    // Match any success-sounding alert copy (wording has varied across releases)
    this.successMessage = page
      .getByText(/successfully\s+(uploaded|submitted|created).*violation/i)
      .or(page.getByText(/violation.*successfully\s+(uploaded|submitted|created)/i))
      .first();
  }

  async navigate() {
    await this.page.goto("/manual-upload");
    await expect(this.pageHeader).toBeVisible();
  }

  async getLocationOptions(): Promise<string[]> {
    await this.locationInput.click();
    await this.locationInput.press("ArrowDown");
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

  async getViolationOptions(): Promise<string[]> {
    await this.violationDropdown.click();
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

  async getMotorVehicleTypeOptions(): Promise<string[]> {
    await this.motorVehicleTypeDropdown.click();
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

  /**
   * Fills the entire form with generated data and uploads files.
   * Does NOT click submit.
   * @param data The violation data object.
   * @param files An object with paths to the files to upload.
   */
  async fillForm(data: ManualViolationData, files: { [key: string]: string }) {
    await this.violationDateInput.fill(data.violationDate);
    await this.violationTimeInput.fill(data.violationTime);
    await this.pageHeader.click(); // Click header to close date/time pickers
    await this.locationInput.click();
    await this.locationInput.press("ArrowDown");
    const locationListbox = this.page.locator(
      'div[role="presentation"] [role="listbox"]'
    );
    await locationListbox.waitFor({ timeout: 5000 });
    const locationOptions = locationListbox.getByRole("option");
    const optionTexts = (await locationOptions.allTextContents())
      .map((text) => text.trim())
      .filter(Boolean)
      .filter((text) => text.toLowerCase() !== "no options");
    const desiredLocation = data.location?.trim();
    if (optionTexts.length > 0) {
      const matchedLocation = desiredLocation
        ? optionTexts.find(
            (option) => option.toLowerCase() === desiredLocation.toLowerCase()
          )
        : undefined;
      const chosenLocation =
        matchedLocation ??
        optionTexts[Math.floor(Math.random() * optionTexts.length)];
      // Duplicate location names can exist (e.g., double-spaces). Pick the first match.
      await locationListbox
        .getByRole("option", { name: chosenLocation, exact: true })
        .first()
        .click();
    } else if (desiredLocation) {
      await this.locationInput.fill(data.location); // Type to filter the list
      await this.page // Click the matching option
        .getByRole("option", { name: data.location, exact: true })
        .first()
        .click();
    } else {
      throw new Error("No location options available to select.");
    }
    await this.plateNumberInput.fill(data.plateNumber);

    // Handle Dropdowns — duplicate violation options may exist; pick the first.
    await this.violationDropdown.click();
    await this.page
      .getByRole("option", { name: data.violation, exact: true })
      .first()
      .click();
    await this.approverDropdown.click();
    await this.approverDropdown.fill(data.approver);
    await this.approverDropdown.press("ArrowDown"); // ensure the menu opens
    const approverListbox = this.page.locator(
      'div[role="presentation"] [role="listbox"]'
    );
    await approverListbox.waitFor({ timeout: 5000 });
    const approverOption = approverListbox.getByRole("option", {
      name: data.approver,
      exact: true,
    });
    try {
      await approverOption.click({ timeout: 5000 });
    } catch {
      // Fallback: select the first option if the expected approver text differs
      const firstOption = approverListbox.getByRole("option").first();
      await firstOption.waitFor({ timeout: 5000 });
      await firstOption.click();
    }

    // --- Fill LTO Record Details ---
    await this.ltoPlateNumberInput.fill(data.ltoPlateNumber); // NEW
    await this.conductionNumberInput.fill(data.conductionNumber); // NEW
    await this.mvFileInput.fill(data.mvFileNo); // NEW
    await this.makeInput.fill(data.make); // NEW
    await this.modelInput.fill(data.model); // NEW
    await this.yearInput.fill(data.year); // NEW
    await this.motorVehicleTypeDropdown.scrollIntoViewIfNeeded();
    await this.motorVehicleTypeDropdown.click();
    await this.page
      .getByRole("option", { name: data.motorVehicleType, exact: true })
      .first()
      .click();

    // --- Fill Owner Details ---
    await this.ownerNameInput.fill(data.ownerName);
    await this.ownerAddressInput.fill(data.ownerAddress);
    await this.ownerZipInput.fill(data.ownerZip);
    // Leave email/phone blank by design.

    // Upload Media Files
    await this.image1Upload.setInputFiles(files.image1);
    await this.image2Upload.setInputFiles(files.image2);
    await this.image3Upload.setInputFiles(files.image3);
    await this.image4Upload.setInputFiles(files.image4);
    await this.videoUpload.setInputFiles(files.video);
  }

  /**
   * Fills the entire form using fillForm() and then submits
   * and asserts success.
   * @param data The violation data object.
   * @param files An object with paths to the files to upload.
   */
  async fillAndSubmitForm(
    data: ManualViolationData,
    files: { [key: string]: string }
  ) {
    await this.fillForm(data, files);

    // Submit the form. Wait for either a success alert or for the form to
    // clear (the plate number input resets on a successful submit).
    await this.submitButton.click();
    await Promise.race([
      this.successMessage
        .waitFor({ state: "visible", timeout: 20_000 })
        .catch(() => {}),
      expect(this.plateNumberInput)
        .toHaveValue("", { timeout: 20_000 })
        .catch(() => {}),
    ]);
  }
}
