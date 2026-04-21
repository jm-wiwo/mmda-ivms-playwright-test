import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(
    process.env.ADMIN_USERNAME!,
    process.env.ADMIN_PASSWORD!
  );

  const dashboardHeader = page.getByRole("heading", { name: /Dashboard/i });
  await expect(dashboardHeader).toBeVisible();

  console.log(
    "Authentication successful and dashboard is stable, saving state..."
  );

  await page.context().storageState({ path: authFile });
  console.log(`Authentication state saved to ${authFile}`);
});
