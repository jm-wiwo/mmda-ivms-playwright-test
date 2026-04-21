import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.rememberMeCheckbox = page.getByLabel("Remember Me");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
    this.loginHeading = page.getByRole("heading", { name: /login|sign in/i });
  }

  async navigate() {
    await this.page.goto("/");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
