import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";

const ROLE_CREDENTIALS: Record<string, { usernameEnv: string; passwordEnv: string }> = {
  validator: {
    usernameEnv: "VALIDATOR_USERNAME",
    passwordEnv: "VALIDATOR_PASSWORD",
  },
  approver: {
    usernameEnv: "APPROVER_USERNAME",
    passwordEnv: "APPROVER_PASSWORD",
  },
  "manual-uploader": {
    usernameEnv: "MANUAL_UPLOADER_USERNAME",
    passwordEnv: "MANUAL_UPLOADER_PASSWORD",
  },
  "vmp-approver": {
    usernameEnv: "VMP_APPROVER_USERNAME",
    passwordEnv: "VMP_APPROVER_PASSWORD",
  },
};

setup("authenticate role", async ({ page }, testInfo) => {
  const roleName = (testInfo.project.use as any).roleName as string;
  if (!roleName) {
    throw new Error("roleName not configured in project use options");
  }

  const creds = ROLE_CREDENTIALS[roleName];
  if (!creds) {
    throw new Error(`Unknown role: ${roleName}`);
  }

  const username = process.env[creds.usernameEnv];
  const password = process.env[creds.passwordEnv];

  if (!username || !password) {
    setup.skip();
    console.log(
      `Skipping auth for role '${roleName}': ${creds.usernameEnv} or ${creds.passwordEnv} not set`
    );
    return;
  }

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  const dashboardHeader = page.getByRole("heading", { name: /Dashboard/i });
  await expect(dashboardHeader).toBeVisible({ timeout: 15_000 });

  const authFile = `playwright/.auth/${roleName}.json`;
  await page.context().storageState({ path: authFile });
  console.log(`Role '${roleName}' authenticated, state saved to ${authFile}`);
});
