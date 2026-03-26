import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld, FRONTEND_URL } from '../support/world';

Given('I am on the registration page', async function (this: ExamManagerWorld) {
  await this.navigateTo('/register');
  await this.page.waitForSelector('#name');
});

When('I fill in the registration form with valid data', async function (this: ExamManagerWorld) {
  const uniqueEmail = `playwright-${Date.now()}@test.com`;
  await this.page.fill('#name', 'Professor Gherkin');
  await this.page.fill('#email', uniqueEmail);
  await this.page.fill('#password', 'senha12345');
  await this.page.fill('#confirm', 'senha12345');
});

When('I fill in the registration form with mismatched passwords', async function (this: ExamManagerWorld) {
  await this.page.fill('#name', 'Professor Gherkin');
  await this.page.fill('#email', `mismatch-${Date.now()}@test.com`);
  await this.page.fill('#password', 'senha12345');
  await this.page.fill('#confirm', 'senhadiferente');
});

When('I submit the registration form', async function (this: ExamManagerWorld) {
  await this.page.click('button[type="submit"]');
});

Then('I should see a success notification', async function (this: ExamManagerWorld) {
  const toast = await this.page.waitForSelector('[data-sonner-toast]', { timeout: 8000 });
  assert.ok(toast, 'Expected success toast notification');
});

Then('I should remain on the registration page', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(500);
  const url = this.page.url();
  assert.ok(url.includes('/register'), `Expected registration URL, got: ${url}`);
});

Then('I should see a password mismatch error', async function (this: ExamManagerWorld) {
  const error = await this.page.locator('text=As senhas não coincidem');
  assert.ok(await error.isVisible(), 'Expected password mismatch error message');
});

Then('I should see a link to the login page', async function (this: ExamManagerWorld) {
  const link = await this.page.locator('a[href="/login"]');
  assert.ok(await link.isVisible(), 'Expected a link to /login');
});
