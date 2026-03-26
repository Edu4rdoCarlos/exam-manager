import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld, FRONTEND_URL } from '../support/world';

Given('I am on the login page', async function (this: ExamManagerWorld) {
  await this.navigateTo('/login');
  await this.page.waitForSelector('#email');
});

Given('I am not logged in', function (this: ExamManagerWorld) {
  // fresh browser context already has no auth state
});

Given('I am logged in as a teacher', { timeout: 30000 }, async function (this: ExamManagerWorld) {
  await this.loginViaUI('rofepssor@exam.com', 'senha123');
  await this.page.waitForSelector('text=Minhas Provas', { timeout: 15000 });
});

When('I fill in the email field with {string}', async function (this: ExamManagerWorld, email: string) {
  await this.page.fill('#email', email);
});

When('I fill in the password field with {string}', async function (this: ExamManagerWorld, password: string) {
  await this.page.fill('#password', password);
});

When('I click the submit button', async function (this: ExamManagerWorld) {
  await this.page.click('button[type="submit"]');
});


Then('I should be redirected to the dashboard', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.page.waitForURL(`${FRONTEND_URL}/dashboard`, { timeout: 12000 });
});

Then('I should see the dashboard page', async function (this: ExamManagerWorld) {
  const url = this.page.url();
  assert.ok(url.includes('/dashboard'), `Expected dashboard URL, got: ${url}`);
});

Then('I should remain on the login page', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(1500);
  const url = this.page.url();
  assert.ok(url.includes('/login'), `Expected login URL, got: ${url}`);
});

Then('I should see an error notification', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  const toast = await this.page.waitForSelector('text=E-mail ou senha inválidos', { timeout: 10000 });
  assert.ok(toast, 'Expected error toast notification');
});

Then('I should be redirected to the login page', async function (this: ExamManagerWorld) {
  await this.page.waitForURL(`${FRONTEND_URL}/login`, { timeout: 10000 });
});

Then('I should see a link to the registration page', async function (this: ExamManagerWorld) {
  const link = this.page.locator('a[href="/register"]');
  assert.ok(await link.isVisible(), 'Expected a link to /register');
});
