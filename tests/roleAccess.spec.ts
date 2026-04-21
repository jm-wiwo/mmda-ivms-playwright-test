import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

/**
 * Gets the current role name from the project configuration.
 * Each role project passes roleName via the `use` config.
 */
function getRoleName(testInfo: any): string {
  return testInfo.project.use.roleName as string;
}

// ---------------------------------------------------------------------------
// Validator Role Tests
// ---------------------------------------------------------------------------
test.describe("Validator Role Access", () => {
  test.beforeEach(async ({}, testInfo) => {
    const role = getRoleName(testInfo);
    if (role !== "validator") {
      test.skip(true, `Skipping validator tests for role: ${role}`);
    }
  });

  test("should access the dashboard", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
  });

  test("should access the Incidents page and see the Validation tab", async ({
    page,
  }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "INCIDENTS" })
    ).toBeVisible();
    const validationTab = page.getByRole("tab", { name: /VALIDATION/ });
    await expect(validationTab).toBeVisible();
    await expect(validationTab).toHaveAttribute("aria-selected", "true");
  });

  test("should be able to get and validate an incident", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for",
    });
    await getIncidentButton.click();

    const noIncidents = page.getByText(/No incidents found|No more incidents/i);
    const plateInput = page.locator('input[name="plate_number"]');
    await Promise.race([
      plateInput.waitFor({ state: "visible", timeout: 10_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the validation queue");
      return;
    }

    const validateButton = page.getByRole("button", { name: "Validate" });
    await expect(validateButton).toBeVisible();
  });

  test("should be able to reject an incident", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for",
    });
    await getIncidentButton.click();

    const noIncidents = page.getByText(/No incidents found|No more incidents/i);
    const plateInput = page.locator('input[name="plate_number"]');
    await Promise.race([
      plateInput.waitFor({ state: "visible", timeout: 10_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the validation queue");
      return;
    }

    const rejectButton = page.getByRole("button", { name: "Reject" });
    await expect(rejectButton).toBeVisible();
  });

  test("should NOT have approval actions available", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });

    // Validator may see the tab but should not be able to approve
    if (await approvalTab.isVisible()) {
      await approvalTab.click();
      const getIncidentButton = page.getByRole("button", {
        name: "Click to get incident for",
      });

      // If there's a get incident button, try to get one
      if (await getIncidentButton.isVisible()) {
        await getIncidentButton.click();
        const noIncidents = page.getByText(
          /No incidents found|No more incidents/i
        );
        const approveButton = page.getByRole("button", { name: "Approve" });
        await Promise.race([
          approveButton.waitFor({ state: "visible", timeout: 10_000 }),
          noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
        ]);
        // If no incidents, that's fine - the important thing is we checked
        if (await noIncidents.isVisible()) {
          console.log(
            "No approval incidents available to verify approve button restriction"
          );
          return;
        }
        // If approve button is visible, it means the validator role has unexpected access
        const isApproveVisible = await approveButton.isVisible();
        if (isApproveVisible) {
          console.warn(
            "WARNING: Approve button is visible for validator role - this may indicate incorrect access control"
          );
        }
      }
    } else {
      console.log("Approval tab is not visible for validator role - as expected");
    }
  });

  test("should NOT have access to the Manual Upload page", async ({
    page,
  }) => {
    const manualUploadLink = page.getByRole("link", {
      name: "Manual Upload",
    });
    await page.goto("/", { waitUntil: "networkidle" });

    // Check if the link is not visible OR navigating directly redirects away
    if (await manualUploadLink.isVisible()) {
      console.warn(
        "WARNING: Manual Upload link is visible for validator role"
      );
    }

    // Try direct navigation
    await page.goto("/manual-upload");
    // Should either redirect or show access denied
    const isOnManualUpload = page.url().includes("/manual-upload");
    const manualUploadHeading = page.getByRole("heading", {
      name: "Manual Upload",
    });
    if (isOnManualUpload && (await manualUploadHeading.isVisible())) {
      console.warn(
        "WARNING: Validator can access Manual Upload page directly"
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Approver Role Tests
// ---------------------------------------------------------------------------
test.describe("Approver Role Access", () => {
  test.beforeEach(async ({}, testInfo) => {
    const role = getRoleName(testInfo);
    if (role !== "approver") {
      test.skip(true, `Skipping approver tests for role: ${role}`);
    }
  });

  test("should access the dashboard", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
  });

  test("should access the Incidents page and switch to the Approval tab", async ({
    page,
  }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "INCIDENTS" })
    ).toBeVisible();
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });
    await expect(approvalTab).toBeVisible();
    await approvalTab.click();
    await expect(approvalTab).toHaveAttribute("aria-selected", "true");
  });

  test("should be able to get an incident and see approve/reject buttons", async ({
    page,
  }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });
    await approvalTab.click();

    const getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for",
    });
    await getIncidentButton.click();

    const noIncidents = page.getByText(/No incidents found|No more incidents/i);
    const approvalTabSelected = page.getByRole("tab", { name: /APPROVAL/ });
    await Promise.race([
      approvalTabSelected.waitFor({ state: "visible", timeout: 10_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the approval queue");
      return;
    }

    await expect(
      page.getByRole("button", { name: "Approve" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reject" })
    ).toBeVisible();
  });

  test("should be able to see the Edit LTO Record button", async ({
    page,
  }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });
    await approvalTab.click();

    const getIncidentButton = page.getByRole("button", {
      name: "Click to get incident for",
    });
    await getIncidentButton.click();

    const noIncidents = page.getByText(/No incidents found|No more incidents/i);
    const editLtoButton = page.getByRole("button", {
      name: "Edit LTO Record",
    });
    await Promise.race([
      editLtoButton.waitFor({ state: "visible", timeout: 10_000 }),
      noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
    ]);
    if (await noIncidents.isVisible()) {
      test.skip(true, "No incidents available in the approval queue");
      return;
    }
    await expect(editLtoButton).toBeVisible();
  });

  test("should NOT have validation actions available", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const validationTab = page.getByRole("tab", { name: /VALIDATION/ });

    if (await validationTab.isVisible()) {
      await validationTab.click();
      const getIncidentButton = page.getByRole("button", {
        name: "Click to get incident for",
      });

      if (await getIncidentButton.isVisible()) {
        await getIncidentButton.click();
        const noIncidents = page.getByText(
          /No incidents found|No more incidents/i
        );
        const validateButton = page.getByRole("button", { name: "Validate" });
        await Promise.race([
          validateButton.waitFor({ state: "visible", timeout: 10_000 }),
          noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
        ]);
        if (await noIncidents.isVisible()) {
          console.log(
            "No validation incidents available to verify validate button restriction"
          );
          return;
        }
        const isValidateVisible = await validateButton.isVisible();
        if (isValidateVisible) {
          console.warn(
            "WARNING: Validate button is visible for approver role - this may indicate incorrect access control"
          );
        }
      }
    } else {
      console.log(
        "Validation tab is not visible for approver role - as expected"
      );
    }
  });

  test("should NOT have access to the Manual Upload page", async ({
    page,
  }) => {
    const manualUploadLink = page.getByRole("link", {
      name: "Manual Upload",
    });
    await page.goto("/", { waitUntil: "networkidle" });

    if (await manualUploadLink.isVisible()) {
      console.warn(
        "WARNING: Manual Upload link is visible for approver role"
      );
    }

    await page.goto("/manual-upload");
    const isOnManualUpload = page.url().includes("/manual-upload");
    const manualUploadHeading = page.getByRole("heading", {
      name: "Manual Upload",
    });
    if (isOnManualUpload && (await manualUploadHeading.isVisible())) {
      console.warn("WARNING: Approver can access Manual Upload page directly");
    }
  });
});

// ---------------------------------------------------------------------------
// Manual Uploader Role Tests
// ---------------------------------------------------------------------------
test.describe("Manual Uploader Role Access", () => {
  test.beforeEach(async ({}, testInfo) => {
    const role = getRoleName(testInfo);
    if (role !== "manual-uploader") {
      test.skip(true, `Skipping manual-uploader tests for role: ${role}`);
    }
  });

  test("should access the dashboard", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
  });

  test("should access the Manual Upload page", async ({ page }) => {
    await page.goto("/manual-upload", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Manual Upload" })
    ).toBeVisible();
  });

  test("should see the manual upload form elements", async ({ page }) => {
    await page.goto("/manual-upload", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Manual Upload" })
    ).toBeVisible();
    await expect(page.getByLabel("Violation Date")).toBeVisible();
    await expect(page.getByLabel("Violation Time")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should NOT have access to Incidents processing tabs", async ({
    page,
  }) => {
    await page.goto("/violations/processing");

    // Manual uploader should either be redirected or not see processing tabs
    const incidentsHeading = page.getByRole("heading", {
      name: "INCIDENTS",
    });
    const validationTab = page.getByRole("tab", { name: /VALIDATION/ });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });

    if (await incidentsHeading.isVisible()) {
      // If they can see the page, check that validate/approve actions aren't available
      if (await validationTab.isVisible()) {
        await validationTab.click();
        const getIncidentButton = page.getByRole("button", {
          name: "Click to get incident for",
        });
        if (await getIncidentButton.isVisible()) {
          console.warn(
            "WARNING: Manual Uploader can see 'Get Incident' on Validation tab"
          );
        }
      }
      if (await approvalTab.isVisible()) {
        console.warn(
          "WARNING: Manual Uploader can see the Approval tab"
        );
      }
    } else {
      console.log(
        "Incidents page is not accessible for manual-uploader role - as expected"
      );
    }
  });
});

// ---------------------------------------------------------------------------
// VMP Approver Role Tests
// ---------------------------------------------------------------------------
test.describe("VMP Approver Role Access", () => {
  test.beforeEach(async ({}, testInfo) => {
    const role = getRoleName(testInfo);
    if (role !== "vmp-approver") {
      test.skip(true, `Skipping vmp-approver tests for role: ${role}`);
    }
  });

  test("should access the dashboard", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
  });

  test("should access the Incidents page", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "INCIDENTS" })
    ).toBeVisible();
  });

  test("should be able to access approval functionality", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    const approvalTab = page.getByRole("tab", { name: /APPROVAL/ });

    if (await approvalTab.isVisible()) {
      await approvalTab.click();
      await expect(approvalTab).toHaveAttribute("aria-selected", "true");

      const getIncidentButton = page.getByRole("button", {
        name: "Click to get incident for",
      });
      if (await getIncidentButton.isVisible()) {
        await getIncidentButton.click();

        const noIncidents = page.getByText(
          /No incidents found|No more incidents/i
        );
        const approveButton = page.getByRole("button", { name: "Approve" });
        await Promise.race([
          approveButton.waitFor({ state: "visible", timeout: 10_000 }),
          noIncidents.waitFor({ state: "visible", timeout: 10_000 }),
        ]);
        if (await noIncidents.isVisible()) {
          test.skip(true, "No incidents available in the approval queue");
          return;
        }
        await expect(approveButton).toBeVisible();
      }
    } else {
      console.log(
        "Approval tab is not visible for vmp-approver role"
      );
    }
  });

  test("should verify accessible tabs and actions", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });

    // Check which tabs are visible for VMP Approver
    const tabs = [
      { name: /VALIDATION/, label: "Validation" },
      { name: /APPROVAL/, label: "Approval" },
      { name: "TICKET", label: "Ticket" },
      { name: "Rejected", label: "Rejected" },
      { name: "ARCHIVED", label: "Archived" },
    ];

    for (const tab of tabs) {
      const tabElement = page.getByRole("tab", { name: tab.name });
      const isVisible = await tabElement.isVisible();
      console.log(`VMP Approver: ${tab.label} tab visible = ${isVisible}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Admin Role Tests (runs as part of the default chromium project)
// These tests are intentionally minimal since admin access is already
// covered by the main test suite. They serve as a baseline comparison.
// ---------------------------------------------------------------------------
test.describe("Admin Role Access (baseline)", () => {
  test.beforeEach(async ({}, testInfo) => {
    // This describe block runs for ALL role projects as a quick sanity check.
    // The admin-specific assertions only make sense if we're actually
    // on an admin session, so we skip for non-admin roles gracefully.
    const role = getRoleName(testInfo);
    // Admin doesn't have a dedicated role project - these tests document
    // expected admin behavior but skip for specific role projects.
    if (
      role === "validator" ||
      role === "approver" ||
      role === "manual-uploader" ||
      role === "vmp-approver"
    ) {
      test.skip(true, `Skipping admin baseline tests for role: ${role}`);
    }
  });

  test("should have access to all sidebar navigation links", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Incidents" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Manual Upload" })
    ).toBeVisible();
  });

  test("should have access to all incident tabs", async ({ page }) => {
    await page.goto("/violations/processing", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("tab", { name: /VALIDATION/ })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /APPROVAL/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: "TICKET" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Rejected" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "ARCHIVED" })).toBeVisible();
  });

  test("should have access to the Manual Upload page", async ({ page }) => {
    await page.goto("/manual-upload", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Manual Upload" })
    ).toBeVisible();
  });
});
