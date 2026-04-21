import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";

test.describe("Login Validation", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("should display the login form elements", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
  });

  test("should display the login heading", async () => {
    await expect(loginPage.loginHeading).toBeVisible();
  });

  test("should show an error message with invalid credentials", async () => {
    await loginPage.login("invalid@example.com", "wrongpassword");
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 });
  });

  test("should not submit with empty email field", async ({ page }) => {
    await loginPage.passwordInput.fill("somepassword");
    await loginPage.loginButton.click();
    // Should remain on login page
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/dashboard/);
  });

  test("should not submit with empty password field", async ({ page }) => {
    await loginPage.emailInput.fill("test@example.com");
    await loginPage.loginButton.click();
    // Should remain on login page
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/dashboard/);
  });

  test("should not submit with both fields empty", async ({ page }) => {
    await loginPage.loginButton.click();
    // Should remain on login page
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/dashboard/);
  });

  test("should toggle the Remember Me checkbox", async () => {
    // Checkbox should be unchecked by default
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

    // Check it
    await loginPage.rememberMeCheckbox.check();
    await expect(loginPage.rememberMeCheckbox).toBeChecked();

    // Uncheck it
    await loginPage.rememberMeCheckbox.uncheck();
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

  test("should clear error message when correcting credentials", async ({
    page,
  }) => {
    // Trigger an error
    await loginPage.login("invalid@example.com", "wrongpassword");
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 });

    // Clear and re-enter valid credentials if available
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) {
      test.skip(
        true,
        "ADMIN_USERNAME or ADMIN_PASSWORD not configured for recovery test"
      );
      return;
    }
    await loginPage.emailInput.clear();
    await loginPage.passwordInput.clear();
    await loginPage.login(username, password);

    const dashboardHeader = page.getByRole("heading", {
      name: /Dashboard/i,
    });
    await expect(dashboardHeader).toBeVisible({ timeout: 15_000 });
  });

  test("should redirect to dashboard after successful login", async ({
    page,
  }) => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) {
      test.skip(true, "ADMIN_USERNAME or ADMIN_PASSWORD not configured");
      return;
    }
    await loginPage.login(username, password);
    const dashboardHeader = page.getByRole("heading", {
      name: /Dashboard/i,
    });
    await expect(dashboardHeader).toBeVisible({ timeout: 15_000 });
  });
});
