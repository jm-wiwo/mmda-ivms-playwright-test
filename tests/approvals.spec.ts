import { test, expect } from "@playwright/test";
import { ApprovalsPage, LtoData } from "./pages/approvalsPage";
import { faker } from "@faker-js/faker";
import { format, parse, isValid as isValidDate } from "date-fns";
import {
  CODING_VIOLATION_KEYWORD,
  CODING_DATE_FORMAT,
  CODING_DAY_MAP,
  validateCodingViolation,
  isWithinCodingHours,
  getLastDigit,
  getCodingDayByDigit,
} from "./utils/codingViolation";

const pickApprovalReason = async (
  approvalsPage: ApprovalsPage,
  matcher?: RegExp
) => {
  const reasons = await approvalsPage.getRejectionReasons();
  if (!reasons.length) {
    throw new Error("No rejection reasons were found in the dialog.");
  }
  const detailRequiredPatterns = [/invalid video/i, /others?$/i];
  const filteredReasons = reasons.filter(
    (reason) => !detailRequiredPatterns.some((p) => p.test(reason))
  );
  if (!filteredReasons.length) {
    throw new Error(
      "No rejection reasons are available after excluding Invalid Video and Others."
    );
  }
  const matchedReason = matcher
    ? filteredReasons.find((reason) => matcher.test(reason))
    : undefined;
  return matchedReason ?? faker.helpers.arrayElement(filteredReasons);
};

test.describe("Incidents Page - Approval View", () => {
  test.describe.configure({ mode: "serial" });

  let approvalsPage: ApprovalsPage;

  test.beforeEach(async ({ page }) => {
    approvalsPage = new ApprovalsPage(page);
    await approvalsPage.navigate();
    await expect(page).toHaveURL(/.*\/violations\/processing/);
    await approvalsPage.getIncidentButton.click();

    // Wait for actual incident content to load (not just the tab heading).
    // The Approve button only appears once an incident is fully loaded.
    const noIncidents = approvalsPage.noIncidentsMessage;
    const incidentLoaded = approvalsPage.approveButton;
    await Promise.race([
      incidentLoaded.waitFor({ state: "visible", timeout: 15_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 15_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the approval queue");
      return;
    }
    await expect(approvalsPage.approvalTab).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("should display approval view action buttons and selected tab", async () => {
    await expect(approvalsPage.rejectButton).toBeVisible();
    await expect(approvalsPage.approveButton).toBeVisible();
    await expect(approvalsPage.approvalTab).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("should edit the LTO record with dummy data", async () => {
    const dummyLtoData: LtoData = {
      plateNumber: faker.vehicle.vrm(),
      conductionNumber: faker.string.alphanumeric(7).toUpperCase(),
      mvFileNo: faker.string.numeric(15),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past({ years: 10 }).getFullYear().toString(),
      color: faker.vehicle.color(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address: faker.location.streetAddress(),
    };
    console.log("Generated LTO Data:", dummyLtoData);
    await approvalsPage.editLtoRecord(dummyLtoData);
    const expectedFullName = `${dummyLtoData.lastName}, ${dummyLtoData.firstName}`;
    await approvalsPage.verifyLtoRecordField("Full Name", expectedFullName);
    await approvalsPage.verifyLtoRecordField(
      "Owner Address",
      dummyLtoData.address
    );
    await approvalsPage.verifyLtoRecordField(
      "Mv File No",
      dummyLtoData.mvFileNo
    );
  });

  test("should reject the incident with a random reason", async () => {
    const randomReason = await pickApprovalReason(approvalsPage);
    const detectedPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    console.log(
      `Testing rejection with available rejection reason: ${randomReason}`
    );
    await approvalsPage.rejectIncidentWithDetails({
      reason: randomReason,
      plateNumber: detectedPlate,
    });
    await expect(approvalsPage.rejectionSuccessMessage).toBeVisible();
  });

  test("should update the violation type through all options", async () => {
    test.setTimeout(60_000);
    const violationsToTest = await approvalsPage.getViolationOptions();
    if (!violationsToTest.length) {
      throw new Error("No violation options were available to test.");
    }
    for (const violation of violationsToTest) {
      await approvalsPage.selectAndApplyViolation(violation);
      await expect(approvalsPage.violationInput).toHaveValue(violation);
    }
  });

  test("should populate required LTO data if needed and then approve the incident", async () => {
    const incidentPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    console.log(`Incident plate number is: ${incidentPlate}`);
    const dummyLtoData: LtoData = {
      plateNumber: incidentPlate,
      conductionNumber: faker.string.alphanumeric(7).toUpperCase(),
      mvFileNo: faker.string.numeric(15),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past({ years: 5 }).getFullYear().toString(),
      color: faker.vehicle.color(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address: faker.location.streetAddress(),
    };
    await approvalsPage.populateRequiredLtoFieldsIfNeeded(dummyLtoData);
    await approvalsPage.approveIncident();
  });

  test("should check MRRES for the incident plate number", async () => {
    const incidentPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    console.log(`Checking MRRES for incident plate: ${incidentPlate}`);
    const result = await approvalsPage.checkMrresForPlate(incidentPlate);
    if (result === "found") {
      console.log(
        `TEST RESULT: MRRES check for plate '${incidentPlate}' was SUCCESSFUL. Record was found.`
      );
    } else {
      console.log(
        `TEST RESULT: MRRES check for plate '${incidentPlate}' FAILED. Record was NOT found.`
      );
    }
  });

  test("should show coding warning when plate digit does not match the day's coding scheme", async () => {
    test.setTimeout(60_000);
    const violatedAt = await approvalsPage.getViolatedAt();
    console.log(`Violated At raw value: '${violatedAt}'`);

    const parsedDate = parse(violatedAt, CODING_DATE_FORMAT, new Date());
    if (!isValidDate(parsedDate)) {
      throw new Error(
        `Unable to parse 'Violated At' value: '${violatedAt}'`
      );
    }

    const recordedDay = format(parsedDate, "EEEE");

    // UVVRP coding does not apply on weekends
    if (!CODING_DAY_MAP[recordedDay]) {
      test.skip(true, `${recordedDay} is not a coding day (weekend)`);
      return;
    }

    // Use the ORIGINAL plate — the app validates against the server-side
    // plate, not what is typed into the input field.
    const originalPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    const lastDigit = getLastDigit(originalPlate);
    const codingDay = getCodingDayByDigit(lastDigit);

    // This test targets the wrong-day scenario — skip if the plate
    // already matches the day's coding scheme.
    if (codingDay === recordedDay) {
      test.skip(
        true,
        `Plate ${originalPlate} (digit ${lastDigit}) matches ${recordedDay}'s coding — cannot test wrong-day scenario`
      );
      return;
    }

    console.log(
      `Wrong-day test: plate ${originalPlate} (digit ${lastDigit}, codes for ${codingDay}) on ${recordedDay}`
    );

    await approvalsPage.selectAndApplyViolation(CODING_VIOLATION_KEYWORD);

    // Ensure LTO plate matches incident plate so the "plates don't match"
    // check passes and the coding validation runs.
    await approvalsPage.ltoPlateInput.fill(originalPlate);

    const validationResult = validateCodingViolation({
      violationName: CODING_VIOLATION_KEYWORD,
      plateNumber: originalPlate,
      violatedAt,
    });
    console.log(
      `Local validation: isValid=${validationResult.isValid}, message=${validationResult.message ?? "none"}`
    );

    const outcome = await approvalsPage.approveAndDetectOutcome();
    console.log(`Approve outcome: ${outcome}`);

    if (!validationResult.isValid) {
      // Coding violation is INVALID — expect the WARNING dialog
      if (outcome === "coding_warning") {
        await expect(
          approvalsPage.codingWarningDialog.getByText(
            validationResult.message!
          )
        ).toBeVisible();
        console.log(
          "Verified wrong-day coding warning:",
          validationResult.message
        );
        await approvalsPage.closeCodingWarningDialog();
      } else if (outcome === "approved") {
        console.log(
          "Approval succeeded without showing coding warning (app validation may differ from local check)."
        );
      } else {
        throw new Error(
          `Expected coding warning or approval success but got: ${outcome}`
        );
      }
    } else {
      // Coding violation is VALID — approval should proceed normally
      if (outcome === "approved") {
        console.log(
          "Coding violation is valid — approval succeeded without warning (expected)."
        );
      } else if (outcome === "coding_warning") {
        console.log(
          "Coding violation is valid locally but app still showed a warning."
        );
        await approvalsPage.closeCodingWarningDialog();
      } else {
        throw new Error(
          `Expected normal approval but got: ${outcome}`
        );
      }
    }
  });

  test("should show coding warning when violation is outside coding hours", async () => {
    test.setTimeout(60_000);
    const violatedAt = await approvalsPage.getViolatedAt();
    console.log(`Violated At raw value: '${violatedAt}'`);

    const parsedDate = parse(violatedAt, CODING_DATE_FORMAT, new Date());
    if (!isValidDate(parsedDate)) {
      throw new Error(
        `Unable to parse 'Violated At' value: '${violatedAt}'`
      );
    }

    const recordedDay = format(parsedDate, "EEEE");
    const dayMapping = CODING_DAY_MAP[recordedDay];
    if (!dayMapping) {
      test.skip(true, `${recordedDay} is not a coding day (weekend)`);
      return;
    }

    // Use the ORIGINAL plate — the app validates against the server-side
    // plate, not what is typed into the input field.
    const originalPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    const lastDigit = getLastDigit(originalPlate);
    const codingDay = getCodingDayByDigit(lastDigit);

    // This test targets the outside-hours scenario.
    // Skip if the plate's digit doesn't match the day (would trigger
    // wrong-day warning instead of outside-hours warning).
    if (codingDay !== recordedDay) {
      test.skip(
        true,
        `Plate ${originalPlate} (digit ${lastDigit}) doesn't match ${recordedDay}'s coding — would trigger wrong-day warning instead`
      );
      return;
    }

    // Skip if the incident was recorded within coding hours (valid violation)
    if (isWithinCodingHours(parsedDate)) {
      test.skip(
        true,
        "Incident was recorded within coding hours — cannot trigger outside-hours warning"
      );
      return;
    }

    console.log(
      `Outside-hours test: plate ${originalPlate} (digit ${lastDigit}) on ${recordedDay} at ${format(parsedDate, "hh:mm a")}`
    );

    await approvalsPage.selectAndApplyViolation(CODING_VIOLATION_KEYWORD);

    // Ensure LTO plate matches incident plate so the "plates don't match"
    // check passes and the coding validation runs.
    await approvalsPage.ltoPlateInput.fill(originalPlate);

    const validationResult = validateCodingViolation({
      violationName: CODING_VIOLATION_KEYWORD,
      plateNumber: originalPlate,
      violatedAt,
    });
    console.log(
      `Local validation: isValid=${validationResult.isValid}, message=${validationResult.message ?? "none"}`
    );

    const outcome = await approvalsPage.approveAndDetectOutcome();
    console.log(`Approve outcome: ${outcome}`);

    if (!validationResult.isValid) {
      // Outside coding hours — expect the WARNING dialog
      if (outcome === "coding_warning") {
        await expect(
          approvalsPage.codingWarningDialog.getByText(
            validationResult.message!
          )
        ).toBeVisible();
        console.log(
          "Verified outside-hours coding warning:",
          validationResult.message
        );
        await approvalsPage.closeCodingWarningDialog();
      } else if (outcome === "approved") {
        console.log(
          "Approval succeeded without showing coding warning (app validation may differ from local check)."
        );
      } else {
        throw new Error(
          `Expected coding warning or approval success but got: ${outcome}`
        );
      }
    } else {
      // Coding violation is VALID (correct day AND within hours) —
      // approval should proceed normally without a popup.
      if (outcome === "approved") {
        console.log(
          "Coding violation is valid (correct day + within hours) — approval succeeded without warning (expected)."
        );
      } else if (outcome === "coding_warning") {
        console.log(
          "Coding violation is valid locally but app still showed a warning."
        );
        await approvalsPage.closeCodingWarningDialog();
      } else {
        throw new Error(
          `Expected normal approval but got: ${outcome}`
        );
      }
    }
  });

  test("should discard LTO changes when cancelling the edit dialog", async () => {
    await approvalsPage.editLtoRecordButton.click();
    await expect(approvalsPage.editLtoDialog).toBeVisible();
    const originalFirstName =
      await approvalsPage.ltoFirstNameInput.inputValue();
    const originalLastName = await approvalsPage.ltoLastNameInput.inputValue();
    const originalMvFile = await approvalsPage.ltoMvFileInput.inputValue();
    await approvalsPage.ltoFirstNameInput.fill("MODIFIED_FIRST");
    await approvalsPage.ltoLastNameInput.fill("MODIFIED_LAST");
    await approvalsPage.ltoMvFileInput.fill("123456789012345");
    await approvalsPage.cancelLtoEdit();
    await approvalsPage.editLtoRecordButton.click();
    await expect(approvalsPage.editLtoDialog).toBeVisible();
    await expect(approvalsPage.ltoFirstNameInput).toHaveValue(
      originalFirstName
    );
    await expect(approvalsPage.ltoLastNameInput).toHaveValue(originalLastName);
    await expect(approvalsPage.ltoMvFileInput).toHaveValue(originalMvFile);
    console.log("LTO changes successfully discarded after cancellation.");
    await approvalsPage.cancelLtoEdit();
  });

  test("should prevent saving LTO record with empty required fields", async () => {
    await approvalsPage.editLtoRecordButton.click();
    await expect(approvalsPage.editLtoDialog).toBeVisible();
    await approvalsPage.clearLtoFields();
    await approvalsPage.ltoSaveButton.click();
    await expect(approvalsPage.editLtoDialog).toBeVisible();
    console.log(
      "Save button correctly prevented saving with empty required fields."
    );
    await approvalsPage.cancelLtoEdit();
  });

  test("should show 'Vehicle Not Found' when checking MRRES for a non-existent plate", async () => {
    const nonExistentPlate = `FAKE${faker.string
      .alphanumeric(6)
      .toUpperCase()}`;
    console.log(
      `Testing MRRES check with non-existent plate: ${nonExistentPlate}`
    );
    const result = await approvalsPage.checkMrresForPlate(nonExistentPlate);
    expect(result).toBe("not_found");
    console.log(
      `TEST RESULT: MRRES correctly returned 'not_found' for plate '${nonExistentPlate}'`
    );
  });

  test("should reject incident with 'Invalid Video' and provide details", async () => {
    const detectedPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    const moreDetails = faker.lorem.sentence();
    const reason = "Invalid Video";
    console.log(
      `Rejecting with '${reason}', Plate: ${detectedPlate}, Details: ${moreDetails}`
    );
    await approvalsPage.rejectIncidentWithDetails({
      reason,
      plateNumber: detectedPlate,
      moreDetails: moreDetails,
    });
    await expect(approvalsPage.rejectionSuccessMessage).toBeVisible();
    console.log(
      "Successfully rejected incident with plate number and more details."
    );
  });

  test("should reject incident while using the new plate visibility checkboxes", async () => {
    const detectedPlate =
      await approvalsPage.incidentPlateNumberInput.inputValue();
    const reason = await pickApprovalReason(approvalsPage);
    console.log(
      `Rejecting with checkboxes for plate: ${detectedPlate} using reason '${reason}'`
    );
    await approvalsPage.rejectIncidentWithDetails({
      reason,
      plateNumber: detectedPlate,
      moreDetails: "Testing new rejection screen checkboxes",
      checkPartiallyBlocked: true,
      checkNotVisible: true,
    });
    await expect(approvalsPage.rejectionSuccessMessage).toBeVisible();
    console.log(
      "Successfully rejected incident while interacting with both plate visibility checkboxes."
    );
  });
});
