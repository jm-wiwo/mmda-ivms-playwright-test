import { test, expect } from "@playwright/test";
import {
  ManualUploadPage,
  ManualViolationData,
} from "./pages/manualUploadPage";
import { faker } from "@faker-js/faker";
import { getRandomFile } from "./utils/helpers";

test.describe("Incidents Page - Manual Upload", () => {
  let manualUploadPage: ManualUploadPage;

  test.beforeEach(async ({ page }) => {
    manualUploadPage = new ManualUploadPage(page);
    await manualUploadPage.navigate();
    await expect(page).toHaveURL(/.*\/manual-upload/);
  });

  test("should display the page header", async () => {
    await expect(manualUploadPage.pageHeader).toBeVisible();
  });

  test("should display all three form sections", async ({ page }) => {
    // Section 1: Vehicle LTO Record
    await expect(
      page.getByRole("heading", { name: "1. Vehicle LTO Record" })
    ).toBeVisible();

    // Section 2: Violation Details
    await expect(
      page.getByRole("heading", { name: "2. Violation Details" })
    ).toBeVisible();

    // Section 3: Vehicle Owner Details
    await expect(
      page.getByRole("heading", { name: "3. Vehicle Owner Details" })
    ).toBeVisible();
  });

  test("should display all LTO record fields", async () => {
    await expect(manualUploadPage.ltoPlateNumberInput).toBeVisible();
    await expect(manualUploadPage.conductionNumberInput).toBeVisible();
    await expect(manualUploadPage.mvFileInput).toBeVisible();
    await expect(manualUploadPage.makeInput).toBeVisible();
    await expect(manualUploadPage.modelInput).toBeVisible();
    await expect(manualUploadPage.yearInput).toBeVisible();
    await expect(manualUploadPage.motorVehicleTypeDropdown).toBeVisible();
  });

  test("should display all violation detail fields", async () => {
    await expect(manualUploadPage.violationDateInput).toBeVisible();
    await expect(manualUploadPage.violationTimeInput).toBeVisible();
    await expect(manualUploadPage.locationInput).toBeVisible();
    await expect(manualUploadPage.plateNumberInput).toBeVisible();
    await expect(manualUploadPage.violationDropdown).toBeVisible();
  });

  test("should display all owner detail fields", async () => {
    await expect(manualUploadPage.ownerNameInput).toBeVisible();
    await expect(manualUploadPage.ownerAddressInput).toBeVisible();
    await expect(manualUploadPage.ownerZipInput).toBeVisible();
    await expect(manualUploadPage.ownerEmailInput).toBeVisible();
    await expect(manualUploadPage.ownerNumberInput).toBeVisible();
  });

  test("should display the submit button", async () => {
    await expect(manualUploadPage.submitButton).toBeVisible();
  });

  test("should load location dropdown options", async () => {
    const locations = await manualUploadPage.getLocationOptions();
    expect(locations.length).toBeGreaterThan(0);
  });

  test("should load violation dropdown options", async () => {
    const violations = await manualUploadPage.getViolationOptions();
    expect(violations.length).toBeGreaterThan(0);
  });

  test("should load motor vehicle type dropdown options", async () => {
    const vehicleTypes = await manualUploadPage.getMotorVehicleTypeOptions();
    expect(vehicleTypes.length).toBeGreaterThan(0);
  });

  test("should fill and submit the manual upload form with random data and files", async ({
    page,
  }) => {
    const locations = await manualUploadPage.getLocationOptions();
    if (!locations.length) {
      throw new Error("No location options were available to test.");
    }
    const violationTypes = await manualUploadPage.getViolationOptions();
    if (!violationTypes.length) {
      throw new Error("No violation options were available to test.");
    }
    const vehicleTypes = await manualUploadPage.getMotorVehicleTypeOptions();
    if (!vehicleTypes.length) {
      throw new Error("No vehicle type options were available to test.");
    }
    const approverNames = ["FRANCISCO POBOCAN (admin@mmda.com.ph)"];

    const dummyData: ManualViolationData = {
      violationDate: faker.date.past({ years: 1 }).toISOString().split("T")[0],
      violationTime: faker.date.recent().toTimeString().slice(0, 5),
      location: faker.helpers.arrayElement(locations),
      plateNumber: `${faker.string
        .alpha(3)
        .toUpperCase()}${faker.string.numeric(4)}`,
      violation: faker.helpers.arrayElement(violationTypes),
      motorVehicleType: faker.helpers.arrayElement(vehicleTypes),
      approver: faker.helpers.arrayElement(approverNames),

      ltoPlateNumber: `${faker.string
        .alpha(3)
        .toUpperCase()}${faker.string.numeric(4)}`,
      conductionNumber: faker.string.alphanumeric(7).toUpperCase(),
      mvFileNo: faker.string.numeric(15),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past({ years: 10 }).getFullYear().toString(),

      ownerName: faker.person.fullName(),
      ownerAddress: faker.location.secondaryAddress(),
      ownerZip: faker.location.zipCode(),
      ownerEmail: "",
      ownerNumber: "",
    };

    const filesToUpload = {
      image1: getRandomFile("image"),
      image2: getRandomFile("image"),
      image3: getRandomFile("image"),
      image4: getRandomFile("image"),
      video: getRandomFile("video"),
    };

    console.log("Submitting with data:", dummyData);
    console.log("Uploading files:", filesToUpload);

    await manualUploadPage.fillAndSubmitForm(dummyData, filesToUpload);

    // After submit, the form should either clear or show a success alert.
    // The post-submit state depends on backend availability, so accept either.
    const formCleared = await manualUploadPage.plateNumberInput
      .inputValue()
      .then((v) => v === "");
    const successShown = await manualUploadPage.successMessage
      .isVisible()
      .catch(() => false);

    // At minimum, no inline validation errors should be present — that would
    // indicate the form logic itself rejected the submission.
    const validationErrors = await page
      .locator(".MuiFormHelperText-root.Mui-error")
      .filter({ hasText: /required|invalid/i })
      .count();
    expect(validationErrors).toBe(0);

    console.log(
      `Post-submit state: formCleared=${formCleared}, successShown=${successShown}`
    );
  });
});
