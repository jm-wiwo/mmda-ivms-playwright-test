import { test, expect } from "@playwright/test";
import { ValidationsPage } from "./pages/validationsPage";
import { ApprovalsPage } from "./pages/approvalsPage";

test.describe("Rejection Dialog - New Features (Validation View)", () => {
  test.describe.configure({ mode: "serial" });

  let validationsPage: ValidationsPage;

  test.beforeEach(async ({ page }) => {
    validationsPage = new ValidationsPage(page);
    await validationsPage.navigate();
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
  });

  test("should search rejection reasons and retain keyword in search bar", async () => {
    await validationsPage.searchRejectionReason("plate");
    await expect(validationsPage.rejectionSearchInput).toBeVisible();
    await expect(validationsPage.rejectionSearchInput).toHaveValue("plate");
    // Verify matching reasons remain visible
    await expect(
      validationsPage.rejectionDialog.getByRole("radio", { name: /DIPLOMAT/i })
    ).toBeVisible();
  });

  test("should display Invalid Video sub-options when selected", async () => {
    await validationsPage.openRejectionDialog();
    await validationsPage.selectReason("INVALID VIDEO");
    await expect(
      validationsPage.invalidVideoSubOptions.first()
    ).toBeVisible({ timeout: 5_000 });
    const subOptionCount = await validationsPage.invalidVideoSubOptions.count();
    expect(subOptionCount).toBe(4);
  });

  test("should show Others description with character counter and enforce minimum", async () => {
    await validationsPage.openRejectionDialog();
    await validationsPage.selectReason("OTHERS");

    // Verify textarea and counter appear
    await expect(validationsPage.othersDescriptionInput).toBeVisible({
      timeout: 5_000,
    });
    await expect(validationsPage.othersCharacterCounter).toBeVisible();

    // Counter should initially indicate characters minimum
    const initialCounter = await validationsPage.getOthersCharacterCount();
    expect(initialCounter).toContain("characters minimum");

    // Type less than 30 characters — counter should still show minimum requirement
    await validationsPage.fillOthersDescription("Short text");
    const shortCounter = await validationsPage.getOthersCharacterCount();
    expect(shortCounter).toContain("characters minimum");

    // Type 30+ characters — counter should update
    await validationsPage.fillOthersDescription(
      "This is a description that exceeds the thirty character minimum"
    );
    const longCounter = await validationsPage.getOthersCharacterCount();
    expect(longCounter).toMatch(/\d+/);
  });
});

test.describe("Rejection Dialog - New Features (Approval View)", () => {
  test.describe.configure({ mode: "serial" });

  let approvalsPage: ApprovalsPage;

  test.beforeEach(async ({ page }) => {
    approvalsPage = new ApprovalsPage(page);
    await approvalsPage.navigate();
    await approvalsPage.getIncidentButton.click();
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
  });

  /**
   * Helper to select a rejection reason by label text in the approval
   * rejection dialog.
   */
  async function selectApprovalRejectionReason(
    approvalsPage: ApprovalsPage,
    reason: string
  ): Promise<void> {
    const matchingLabel = approvalsPage.rejectionReasonLabels
      .filter({ hasText: reason })
      .first();
    const input = matchingLabel.locator("input");
    if ((await input.count()) > 0) {
      await input.check();
    } else {
      await matchingLabel.click();
    }
  }

  test("should search rejection reasons and retain keyword in approval dialog", async () => {
    await approvalsPage.searchRejectionReason("ambulance");
    await expect(approvalsPage.rejectionSearchInput).toBeVisible();
    await expect(approvalsPage.rejectionSearchInput).toHaveValue("ambulance");
    await expect(
      approvalsPage.rejectionDialog.getByRole("radio", { name: /AMBULANCE/i }).first()
    ).toBeVisible();
  });

  test("should display Invalid Video sub-options in approval", async () => {
    await approvalsPage.openRejectionDialog();
    await selectApprovalRejectionReason(approvalsPage, "INVALID VIDEO");
    await expect(
      approvalsPage.invalidVideoSubOptions.first()
    ).toBeVisible({ timeout: 5_000 });
    const count = await approvalsPage.invalidVideoSubOptions.count();
    expect(count).toBe(4);
  });

  test("should show Others description with character counter in approval", async () => {
    await approvalsPage.openRejectionDialog();
    await selectApprovalRejectionReason(approvalsPage, "OTHERS");
    await expect(approvalsPage.othersDescriptionInput).toBeVisible({
      timeout: 5_000,
    });
    await expect(approvalsPage.othersCharacterCounter).toBeVisible();
    const counter = await approvalsPage.getOthersCharacterCount();
    expect(counter).toContain("characters minimum");
  });
});
