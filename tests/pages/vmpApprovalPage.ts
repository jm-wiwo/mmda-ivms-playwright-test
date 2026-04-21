import { type Page, type Locator, expect } from "@playwright/test";

export class VmpApprovalPage {
  readonly page: Page;
  readonly pageHeading: Locator;

  // Main tabs
  readonly userRegistrationTab: Locator;
  readonly vehicleRegistrationTab: Locator;

  // User Registration Filters
  readonly userAccountFilterAll: Locator;
  readonly userAccountFilterPersonal: Locator;
  readonly userAccountFilterCorporate: Locator;
  readonly userStatusForReview: Locator;
  readonly userStatusApproved: Locator;
  readonly userStatusRejected: Locator;
  readonly userStatusBlocked: Locator;
  readonly userStartDate: Locator;
  readonly userEndDate: Locator;
  readonly userNameSearch: Locator;
  readonly userNameSearchClear: Locator;

  // User Registration Table
  readonly userTable: Locator;
  readonly userTableRows: Locator;
  readonly userViewDetailsButtons: Locator;

  // Vehicle Registration Filters
  readonly vehicleAccountFilterAll: Locator;
  readonly vehicleAccountFilterPersonal: Locator;
  readonly vehicleAccountFilterCorporate: Locator;
  readonly vehicleStatusForReview: Locator;
  readonly vehicleStatusApproved: Locator;
  readonly vehicleStartDate: Locator;
  readonly vehicleEndDate: Locator;
  readonly plateNumberSearch: Locator;
  readonly plateNumberSearchClear: Locator;

  // Vehicle Registration Table
  readonly vehicleTable: Locator;
  readonly vehicleTableRows: Locator;
  readonly vehicleViewDetailsButtons: Locator;

  // Pagination (shared)
  readonly paginationInfo: Locator;
  readonly pageSpinbutton: Locator;
  readonly rowsPerPageSpinbutton: Locator;

  // Registration Details Dialog
  readonly registrationDialog: Locator;
  readonly registrationDialogCloseButton: Locator;
  readonly registrationDialogOwnerName: Locator;
  readonly registrationDialogPersonalTab: Locator;
  readonly registrationDialogVehiclesTab: Locator;
  readonly registrationDialogRejectButton: Locator;
  readonly registrationDialogApproveButton: Locator;
  readonly vehiclePlateNumber: Locator;
  readonly vehicleMvFile: Locator;
  readonly vehicleConduction: Locator;
  readonly officialReceiptHeading: Locator;
  readonly certificateOfRegistrationHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", { name: "VMP APPROVAL" });

    // Main tabs (these are clickable divs, not actual tab roles)
    this.userRegistrationTab = page.getByText("USER REGISTRATION", {
      exact: true,
    });
    this.vehicleRegistrationTab = page.getByText("VEHICLE REGISTRATION", {
      exact: true,
    });

    // --- User Registration Filters ---
    // These are only visible when the User Registration tab is active.
    this.userAccountFilterAll = page.getByRole("button", {
      name: "ALL",
      exact: true,
    });
    this.userAccountFilterPersonal = page.getByRole("button", {
      name: "PERSONAL",
      exact: true,
    });
    this.userAccountFilterCorporate = page.getByRole("button", {
      name: "CORPORATE",
      exact: true,
    });
    this.userStatusForReview = page.getByRole("button", {
      name: "FOR REVIEW",
      exact: true,
    });
    this.userStatusApproved = page.getByRole("button", {
      name: "APPROVED",
      exact: true,
    });
    this.userStatusRejected = page.getByRole("button", {
      name: "REJECTED",
      exact: true,
    });
    this.userStatusBlocked = page.getByRole("button", {
      name: "BLOCKED",
      exact: true,
    });
    this.userStartDate = page.getByRole("textbox", { name: "Start Date" });
    this.userEndDate = page.getByRole("textbox", { name: "End Date" });
    this.userNameSearch = page.getByRole("textbox", { name: "User Name" });
    this.userNameSearchClear = page.getByRole("button", { name: "Clear" });

    // --- User Registration Table ---
    this.userTable = page.locator('table[aria-label="customized table"]');
    this.userTableRows = this.userTable.locator("tbody tr");
    // User rows use "View Registration" (not "View Registration Details")
    this.userViewDetailsButtons = page.getByRole("button", {
      name: "View Registration",
      exact: true,
    });

    // --- Vehicle Registration Filters ---
    // These share the same button names as user filters; only one set is
    // visible at a time because the tab sections toggle visibility.
    this.vehicleAccountFilterAll = page.getByRole("button", {
      name: "ALL",
      exact: true,
    });
    this.vehicleAccountFilterPersonal = page.getByRole("button", {
      name: "PERSONAL",
      exact: true,
    });
    this.vehicleAccountFilterCorporate = page.getByRole("button", {
      name: "CORPORATE",
      exact: true,
    });
    this.vehicleStatusForReview = page.getByRole("button", {
      name: "FOR REVIEW",
      exact: true,
    });
    this.vehicleStatusApproved = page.getByRole("button", {
      name: "APPROVED",
      exact: true,
    });
    this.vehicleStartDate = page.getByRole("textbox", { name: "Start Date" });
    this.vehicleEndDate = page.getByRole("textbox", { name: "End Date" });
    this.plateNumberSearch = page.getByRole("textbox", {
      name: "Plate Number",
    });
    this.plateNumberSearchClear = page.getByRole("button", { name: "Clear" });

    // --- Vehicle Registration Table ---
    this.vehicleTable = page.locator('table[aria-label="customized table"]');
    this.vehicleTableRows = this.vehicleTable.locator("tbody tr");
    // Vehicle rows use "View Vehicle" (different label from user rows)
    this.vehicleViewDetailsButtons = page.getByRole("button", {
      name: "View Vehicle",
      exact: true,
    });

    // --- Pagination (shared, visible on whichever tab is active) ---
    this.paginationInfo = page.getByText(/Showing \d+.*of \d+ entries/);
    this.pageSpinbutton = page.getByRole("spinbutton", { name: "Page" });
    this.rowsPerPageSpinbutton = page.getByRole("spinbutton", {
      name: "Rows per page",
    });

    // --- Registration Details Dialog ---
    this.registrationDialog = page.getByRole("dialog");
    // The dialog heading has Previous, Next, and Close buttons (all unlabeled).
    // The close button is the last one.
    this.registrationDialogCloseButton = this.registrationDialog
      .getByRole("heading", { level: 2 })
      .getByRole("button")
      .last();
    // The owner name is the second heading in the dialog (first is the dialog title)
    this.registrationDialogOwnerName = this.registrationDialog
      .getByRole("heading")
      .nth(1);
    this.registrationDialogPersonalTab = this.registrationDialog.getByRole(
      "tab",
      { name: "Personal" }
    );
    this.registrationDialogVehiclesTab = this.registrationDialog.getByRole(
      "tab",
      { name: "Vehicles" }
    );
    this.registrationDialogRejectButton = this.registrationDialog.getByRole(
      "button",
      { name: "Reject" }
    );
    this.registrationDialogApproveButton = this.registrationDialog.getByRole(
      "button",
      { name: "Approve" }
    );

    // Vehicle detail fields inside the dialog
    this.vehiclePlateNumber = this.registrationDialog.getByText(
      /Plate Number/i
    );
    this.vehicleMvFile = this.registrationDialog.getByText(/MV File/i);
    this.vehicleConduction = this.registrationDialog.getByText(/Conduction/i);

    // Document section headings
    this.officialReceiptHeading = this.registrationDialog.getByText(
      /OFFICIAL RECEIPT/i
    );
    this.certificateOfRegistrationHeading = this.registrationDialog.getByText(
      /CERTIFICATE OF REGISTRATION/i
    );
  }

  async navigate() {
    await this.page.goto("/vmp/", { waitUntil: "domcontentloaded" });
    await expect(this.pageHeading).toBeVisible({ timeout: 15_000 });
    // Wait for the table data to load (loading spinner disappears)
    await this.userTable
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  }

  async switchToUserRegistration() {
    await this.userRegistrationTab.click();
    // Wait for user table to load (it shows "View Registration" buttons)
    await this.userViewDetailsButtons
      .first()
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
  }

  async switchToVehicleRegistration() {
    await this.vehicleRegistrationTab.click();
    // Wait for vehicle table to load
    await this.page
      .locator('table[aria-label="customized table"] tbody tr')
      .first()
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
  }

  async filterUsersByAccountType(type: "ALL" | "PERSONAL" | "CORPORATE") {
    const buttonMap: Record<string, Locator> = {
      ALL: this.userAccountFilterAll,
      PERSONAL: this.userAccountFilterPersonal,
      CORPORATE: this.userAccountFilterCorporate,
    };
    await buttonMap[type].click();
  }

  async filterUsersByStatus(
    status: "FOR REVIEW" | "APPROVED" | "REJECTED" | "BLOCKED"
  ) {
    const buttonMap: Record<string, Locator> = {
      "FOR REVIEW": this.userStatusForReview,
      APPROVED: this.userStatusApproved,
      REJECTED: this.userStatusRejected,
      BLOCKED: this.userStatusBlocked,
    };
    await buttonMap[status].click();
  }

  async searchUserByName(name: string) {
    await this.userNameSearch.fill(name);
    // Wait for the table to update after search input
    await this.page.waitForTimeout(500);
  }

  async filterVehiclesByAccountType(type: "ALL" | "PERSONAL" | "CORPORATE") {
    const buttonMap: Record<string, Locator> = {
      ALL: this.vehicleAccountFilterAll,
      PERSONAL: this.vehicleAccountFilterPersonal,
      CORPORATE: this.vehicleAccountFilterCorporate,
    };
    await buttonMap[type].click();
  }

  async filterVehiclesByStatus(status: "FOR REVIEW" | "APPROVED") {
    const buttonMap: Record<string, Locator> = {
      "FOR REVIEW": this.vehicleStatusForReview,
      APPROVED: this.vehicleStatusApproved,
    };
    await buttonMap[status].click();
  }

  async searchVehicleByPlate(plate: string) {
    await this.plateNumberSearch.fill(plate);
    // Wait for the table to update after search input
    await this.page.waitForTimeout(500);
  }

  async openFirstUserDetails() {
    const firstViewButton = this.userViewDetailsButtons.first();
    await firstViewButton.waitFor({ state: "visible", timeout: 10_000 });
    await firstViewButton.click();
    await expect(this.registrationDialog).toBeVisible();
  }

  async openFirstVehicleDetails() {
    const firstViewButton = this.vehicleViewDetailsButtons.first();
    await firstViewButton.waitFor({ state: "visible", timeout: 10_000 });
    await firstViewButton.click();
    await expect(this.registrationDialog).toBeVisible();
  }

  async closeRegistrationDialog() {
    await this.registrationDialogCloseButton.click();
    await expect(this.registrationDialog).not.toBeVisible();
  }

  async getTableRowCount(): Promise<number> {
    const table = this.page.locator(
      'table[aria-label="customized table"] tbody tr'
    );
    try {
      await table.first().waitFor({ state: "visible", timeout: 5_000 });
    } catch {
      return 0;
    }
    return table.count();
  }

  async getPaginationInfo(): Promise<string> {
    await this.paginationInfo.waitFor({ state: "visible", timeout: 5_000 });
    return (await this.paginationInfo.textContent()) ?? "";
  }
}
