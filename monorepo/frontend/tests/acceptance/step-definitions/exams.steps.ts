import { When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld, FRONTEND_URL } from '../support/world';

When('I navigate to the dashboard', async function (this: ExamManagerWorld) {
  await this.navigateTo('/dashboard');
});

When('I navigate to create a new exam', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.navigateTo('/exams/new');
  await this.page.waitForSelector('#title', { timeout: 10000 });
});

When('I fill in the exam title with {string}', async function (this: ExamManagerWorld, title: string) {
  await this.page.fill('#title', title);
});

When('I fill in the exam subject with {string}', async function (this: ExamManagerWorld, subject: string) {
  await this.page.fill('#subject', subject);
});

When('I select at least one question', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(1500);
  const checkboxes = this.page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  if (count > 0) {
    await checkboxes.first().check();
  }
});

When('I submit the exam form', async function (this: ExamManagerWorld) {
  await this.page.click('button:has-text("Criar Prova")');
});

When('I click the cancel button', { timeout: 10000 }, async function (this: ExamManagerWorld) {
  await this.page.click('button:has-text("Cancelar")');
});

Then('I should see the exams section', async function (this: ExamManagerWorld) {
  const url = this.page.url();
  assert.ok(url.includes('/dashboard'), `Expected dashboard URL, got: ${url}`);
});

Then('I should see the new exam form', async function (this: ExamManagerWorld) {
  const title = await this.page.locator('#title');
  assert.ok(await title.isVisible(), 'Expected #title input on new exam form');
});

Then('the form should contain fields for title, subject and answer format', async function (this: ExamManagerWorld) {
  assert.ok(await this.page.locator('#title').isVisible(), 'Expected #title field');
  assert.ok(await this.page.locator('#subject').isVisible(), 'Expected #subject field');
  const format = this.page.locator('text=Formato de resposta');
  assert.ok(await format.isVisible(), 'Expected answer format selector');
});

Then('I should be redirected to the exam detail page', async function (this: ExamManagerWorld) {
  await this.page.waitForURL(/\/exams\/[^/]+$/, { timeout: 15000 });
  const url = this.page.url();
  assert.ok(url.match(/\/exams\/[^/]+$/), `Expected exam detail URL, got: ${url}`);
});

Then('I should see {string} on the page', async function (this: ExamManagerWorld, text: string) {
  const element = await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
  assert.ok(element, `Expected to see "${text}" on the page`);
});

Then('I should not be on the new exam page', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(1000);
  const url = this.page.url();
  assert.ok(!url.endsWith('/exams/new'), `Expected to leave /exams/new, but still there: ${url}`);
});
