import { When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld, FRONTEND_URL } from '../support/world';

When('I navigate to the new student page', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.navigateTo('/students/new');
  await this.page.waitForSelector('#name', { timeout: 10000 });
});

When('I fill in the student name with {string}', { timeout: 10000 }, async function (this: ExamManagerWorld, name: string) {
  await this.page.fill('#name', name);
});

When('I fill in the student CPF with {string}', { timeout: 10000 }, async function (this: ExamManagerWorld, _cpf: string) {
  const ts = Date.now().toString().slice(-9);
  const uniqueCpf = `${ts.slice(0, 3)}.${ts.slice(3, 6)}.${ts.slice(6)}-00`;
  await this.page.fill('#cpf', uniqueCpf);
});

When('I submit the student form', async function (this: ExamManagerWorld) {
  await this.page.click('button:has-text("Cadastrar")');
});

Then('I should see the student registration form', async function (this: ExamManagerWorld) {
  assert.ok(await this.page.locator('#name').isVisible(), 'Expected #name field');
  assert.ok(await this.page.locator('#cpf').isVisible(), 'Expected #cpf field');
});

Then('the form should have name and CPF fields', async function (this: ExamManagerWorld) {
  assert.ok(await this.page.locator('#name').isVisible(), 'Expected name field');
  assert.ok(await this.page.locator('#cpf').isVisible(), 'Expected CPF field');
});

Then('I should not be on the new student page', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(1000);
  const url = this.page.url();
  assert.ok(!url.endsWith('/students/new'), `Expected to leave /students/new, but still there: ${url}`);
});
