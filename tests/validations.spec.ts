import { test, expect } from "@playwright/test";
import { ValidationsPage } from "./pages/validationsPage";
import { faker } from "@faker-js/faker";
import { generatePlateNumber } from "./utils/helpers";

async function ensurePlateNumberFilled(
  validationsPage: ValidationsPage
): Promise<string> {
  const detectedPlate = await validationsPage.plateNumberInput.inputValue();
  if (detectedPlate) {
    return detectedPlate;
  }
  const generatedPlate = generatePlateNumber();
  await validationsPage.updatePlateNumber(generatedPlate);
  return generatedPlate;
}

/**
 * Patterns that match rejection reasons requiring the "More Details"
 * text box to be filled before the rejection can be submitted.
 * Matched case-insensitively against the reason label.
 */
const DETAIL_REQUIRED_PATTERNS = [/invalid video/i, /others?$/i];

const pickReason = async (
  validationsPage: ValidationsPage,
  matcher?: RegExp
): Promise<string> => {
  const reasons = await validationsPage.getRejectionReasons();
  if (!reasons.length) {
    throw new Error("No rejection reasons were found in the dialog.");
  }

  const isDetailRequired = (r: string) =>
    DETAIL_REQUIRED_PATTERNS.some((p) => p.test(r));

  // Unless a specific matcher is provided, exclude reasons that need
  // additional details — those are covered by a dedicated test.
  const filteredReasons = matcher
    ? reasons
    : reasons.filter((r) => !isDetailRequired(r));

  if (!filteredReasons.length) {
    throw new Error(
      "No rejection reasons available after excluding detail-required ones."
    );
  }

  const matchedReason = matcher
    ? filteredReasons.find((reason) => matcher.test(reason))
    : undefined;
  return matchedReason ?? faker.helpers.arrayElement(filteredReasons);
};

test.describe("Incidents Page - Validation View", () => {
  test.describe.configure({ mode: "serial" });

  let validationsPage: ValidationsPage;

  test.beforeEach(async ({ page }) => {
    validationsPage = new ValidationsPage(page);
    await validationsPage.navigate();
    await expect(page).toHaveURL(/.*\/violations\/processing/);

    await validationsPage.getIncidentButton.click();

    const noIncidents = validationsPage.noIncidentsMessage;
    const plateInput = validationsPage.plateNumberInput;
    await Promise.race([
      plateInput.waitFor({ state: "visible", timeout: 10_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the validation queue");
      return;
    }
    await expect(plateInput).toBeVisible();
  });

  test("should display validation view action buttons and selected tab", async () => {
    await expect(validationsPage.rejectButton).toBeVisible();
    await expect(validationsPage.validateButton).toBeVisible();
    await expect(validationsPage.validationTab).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("should update the violation type through all options", async () => {
    test.setTimeout(60_000);
    const violationsToTest = await validationsPage.getViolationOptions();
    if (!violationsToTest.length) {
      throw new Error("No violation options were available to test.");
    }

    for (const violation of violationsToTest) {
      await validationsPage.selectAndApplyViolation(violation);
      await expect(validationsPage.violationInput).toHaveValue(violation);
    }
  });

  test("should update the plate number using faker-generated data", async () => {
    const newPlateNumber = generatePlateNumber();
    console.log(`Generated Plate Number for test: ${newPlateNumber}`);

    await validationsPage.updatePlateNumber(newPlateNumber);

    await expect(validationsPage.plateNumberInput).toHaveValue(newPlateNumber);

    await validationsPage.moreDetailsAccordion.click();
    await expect(validationsPage.detailsPlateNumberValue).toHaveText(
      newPlateNumber
    );
  });

  test("should validate the incident and show a success message", async () => {
    await validationsPage.validateIncident();

    // The new confirmation dialog appears first — confirm through it
    await validationsPage.confirmValidation();

    await expect(validationsPage.validationSuccessMessage).toBeVisible({
      timeout: 15_000,
    });
  });

  test("should reject the incident with a random reason", async () => {
    const randomReason = await pickReason(validationsPage);
    const detectedPlate = await validationsPage.plateNumberInput.inputValue();
    console.log(
      `Testing rejection with available rejection reason: ${randomReason}`
    );

    await validationsPage.rejectIncidentWithDetails({
      reason: randomReason,
      plateNumber: detectedPlate,
    });

    await expect(validationsPage.rejectionSuccessMessage).toBeVisible();
  });

  test("should require more details before rejecting with 'Invalid Video' or 'Others'", async () => {
    const detectedPlate = await ensurePlateNumberFilled(validationsPage);
    const reasons = await validationsPage.getRejectionReasons();

    // Find a reason that requires more details
    const detailReason = reasons.find((r) =>
      DETAIL_REQUIRED_PATTERNS.some((p) => p.test(r))
    );
    if (!detailReason) {
      test.skip(
        true,
        "Neither 'Invalid Video' nor 'Others' is available as a rejection reason"
      );
      return;
    }

    console.log(
      `Testing detail-required rejection with reason: '${detailReason}'`
    );

    // Select the reason
    await validationsPage.selectReason(detailReason);

    const isInvalidVideo = /invalid video/i.test(detailReason);

    if (isInvalidVideo) {
      // "Invalid Video" now shows sub-options instead of a textarea
      await expect(
        validationsPage.invalidVideoSubOptions.first()
      ).toBeVisible({ timeout: 5_000 });
      console.log("'Invalid Video' sub-options appeared.");
      // Select the first sub-option
      await validationsPage.invalidVideoSubOptions.first().click();
    } else {
      // "Others" shows the description textarea
      const moreDetailsInput = validationsPage.rejectionMoreDetailsInput;
      await expect(moreDetailsInput).toBeVisible({ timeout: 3_000 });
      console.log(
        "'More Details' text box appeared after selecting the reason."
      );
      // Fill with 30+ characters to meet the minimum
      const moreDetails = faker.lorem.sentence({ min: 6, max: 10 });
      await moreDetailsInput.fill(moreDetails);
      console.log(`Filled 'More Details' with: '${moreDetails}'`);
    }

    // Fill in the plate number if available
    try {
      await validationsPage.rejectionPlateNumberInput.waitFor({
        state: "visible",
        timeout: 2_000,
      });
      await validationsPage.rejectionPlateNumberInput.fill(detectedPlate);
    } catch {
      // Plate number field may not be available for this reason
    }

    // Submit the rejection
    await validationsPage.rejectionSubmitButton.click();
    await expect(validationsPage.rejectionSuccessMessage).toBeVisible();
    console.log(
      `Successfully rejected incident with '${detailReason}' after providing more details.`
    );
  });

  test("should show confirmation dialog with summary and correct incident details", async () => {
    const plateNumber = await ensurePlateNumberFilled(validationsPage);
    const violation = await validationsPage.violationInput.inputValue();

    await validationsPage.validateIncident();
    await validationsPage.waitForValidationConfirmDialog();

    await expect(validationsPage.confirmValidationDialog).toBeVisible();
    await expect(
      validationsPage.confirmValidationDialog.getByRole("heading", {
        name: /confirm validation/i,
      })
    ).toBeVisible();

    // Verify summary contains correct incident data
    const summary = await validationsPage.getConfirmationSummary();
    expect(summary.plateNo).toBe(plateNumber);
    expect(summary.vehicleType).toBeTruthy();
    expect(summary.violation).toBeTruthy();
    if (violation) {
      expect(summary.violation.toLowerCase()).toBe(violation.toLowerCase());
    }

    // Verify dialog buttons are visible and enabled
    await expect(validationsPage.confirmValidationCancelButton).toBeVisible();
    await expect(validationsPage.confirmValidationSubmitButton).toBeVisible();
    await expect(validationsPage.confirmValidationSubmitButton).toBeEnabled();

    // Cancel so we don't actually validate
    await validationsPage.cancelValidation();
  });

  test("should cancel validation from the confirmation dialog", async () => {
    await ensurePlateNumberFilled(validationsPage);
    await validationsPage.validateIncident();
    await validationsPage.waitForValidationConfirmDialog();

    await expect(validationsPage.confirmValidationDialog).toBeVisible();

    await validationsPage.cancelValidation();

    await expect(validationsPage.confirmValidationDialog).not.toBeVisible();
    await expect(validationsPage.validateButton).toBeVisible();
  });

});
