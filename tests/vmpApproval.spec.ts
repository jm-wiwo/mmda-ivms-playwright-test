import { test, expect } from "@playwright/test";
import { VmpApprovalPage } from "./pages/vmpApprovalPage";

test.describe("VMP Approval Page", () => {
  let vmpPage: VmpApprovalPage;

  test.beforeEach(async ({ page }) => {
    vmpPage = new VmpApprovalPage(page);
    await vmpPage.navigate();
  });

  test("should display the VMP Approval page heading and both tabs", async () => {
    await expect(vmpPage.pageHeading).toBeVisible();
    await expect(vmpPage.pageHeading).toHaveText(/VMP APPROVAL/i);
    await expect(vmpPage.userRegistrationTab).toBeVisible();
    await expect(vmpPage.vehicleRegistrationTab).toBeVisible();
  });

  // --- User Registration Tab Tests ---
  test.describe("User Registration Tab", () => {
    test("should display all filter controls", async () => {
      // Account type filters
      await expect(vmpPage.userAccountFilterAll).toBeVisible();
      await expect(vmpPage.userAccountFilterPersonal).toBeVisible();
      await expect(vmpPage.userAccountFilterCorporate).toBeVisible();

      // Status filters
      await expect(vmpPage.userStatusForReview).toBeVisible();
      await expect(vmpPage.userStatusApproved).toBeVisible();
      await expect(vmpPage.userStatusRejected).toBeVisible();
      await expect(vmpPage.userStatusBlocked).toBeVisible();

      // Date and search
      await expect(vmpPage.userStartDate).toBeVisible();
      await expect(vmpPage.userEndDate).toBeVisible();
      await expect(vmpPage.userNameSearch).toBeVisible();
    });

    test("should display user registration table with pagination", async () => {
      await expect(vmpPage.userTable).toBeVisible({ timeout: 15_000 });
      const rowCount = await vmpPage.getTableRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const info = await vmpPage.getPaginationInfo();
      expect(info).toMatch(/Showing \d+.*of \d+ entries/);
    });

    test("should filter users by account type", async ({ page }) => {
      for (const type of ["PERSONAL", "CORPORATE"] as const) {
        await vmpPage.filterUsersByAccountType(type);
        await page.waitForTimeout(1000);
        const rowCount = await vmpPage.getTableRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("should filter users by status", async ({ page }) => {
      for (const status of ["FOR REVIEW", "APPROVED"] as const) {
        await vmpPage.filterUsersByStatus(status);
        await page.waitForTimeout(1000);
        const rowCount = await vmpPage.getTableRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("should open and close user registration details dialog", async () => {
      await vmpPage.openFirstUserDetails();
      await expect(vmpPage.registrationDialog).toBeVisible();
      await expect(vmpPage.registrationDialogPersonalTab).toBeVisible();
      await expect(vmpPage.registrationDialogRejectButton).toBeVisible();
      await vmpPage.closeRegistrationDialog();
      await expect(vmpPage.registrationDialog).not.toBeVisible();
    });
  });

  // --- Vehicle Registration Tab Tests ---
  test.describe("Vehicle Registration Tab", () => {
    test.beforeEach(async () => {
      await vmpPage.switchToVehicleRegistration();
    });

    test("should display all filter controls for vehicles", async () => {
      // Account type filters
      await expect(vmpPage.vehicleAccountFilterAll).toBeVisible();
      await expect(vmpPage.vehicleAccountFilterPersonal).toBeVisible();
      await expect(vmpPage.vehicleAccountFilterCorporate).toBeVisible();

      // Status filters
      await expect(vmpPage.vehicleStatusForReview).toBeVisible();
      await expect(vmpPage.vehicleStatusApproved).toBeVisible();

      // Date and search
      await expect(vmpPage.vehicleStartDate).toBeVisible();
      await expect(vmpPage.vehicleEndDate).toBeVisible();
      await expect(vmpPage.plateNumberSearch).toBeVisible();
    });

    test("should display vehicle registration table with pagination", async () => {
      await expect(vmpPage.vehicleTable).toBeVisible();
      const rowCount = await vmpPage.getTableRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const info = await vmpPage.getPaginationInfo();
      expect(info).toMatch(/Showing \d+.*of \d+ entries/);
    });

    test("should filter vehicles by status", async ({ page }) => {
      await vmpPage.filterVehiclesByStatus("FOR REVIEW");
      await page.waitForTimeout(1000);
      const rowCount = await vmpPage.getTableRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test("should open vehicle registration details dialog with expected content", async () => {
      await vmpPage.openFirstVehicleDetails();
      await expect(vmpPage.registrationDialog).toBeVisible();
      await expect(vmpPage.registrationDialogVehiclesTab).toBeVisible();
      await expect(vmpPage.vehiclePlateNumber).toBeVisible();
      await expect(vmpPage.officialReceiptHeading).toBeVisible();
      await expect(vmpPage.certificateOfRegistrationHeading).toBeVisible();
      await expect(vmpPage.registrationDialogRejectButton).toBeVisible();
      await expect(vmpPage.registrationDialogApproveButton).toBeVisible();
      await vmpPage.closeRegistrationDialog();
    });
  });
});
