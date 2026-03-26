import { When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld } from '../support/world';

When('I navigate to the questions page', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.navigateTo('/questions');
  await this.page.waitForSelector('text=Banco de Questões', { timeout: 10000 });
});

When('I click the {string} button', { timeout: 15000 }, async function (this: ExamManagerWorld, label: string) {
  await this.page.waitForSelector(`button:has-text("${label}")`, { timeout: 10000 });
  await this.page.click(`button:has-text("${label}")`);
});

When('I fill in the question statement with {string}', { timeout: 15000 }, async function (this: ExamManagerWorld, statement: string) {
  await this.page.waitForSelector('#statement', { timeout: 10000 });
  await this.page.fill('#statement', statement);
});

When('I fill in the first alternative with {string}', { timeout: 10000 }, async function (this: ExamManagerWorld, text: string) {
  const input = this.page.locator('input[placeholder^="Descrição da alternativa A"]');
  await input.waitFor({ timeout: 8000 });
  await input.fill(text);
});

When('I fill in the second alternative with {string}', { timeout: 10000 }, async function (this: ExamManagerWorld, text: string) {
  const input = this.page.locator('input[placeholder^="Descrição da alternativa B"]');
  await input.waitFor({ timeout: 8000 });
  await input.fill(text);
});

When('I save the question', { timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.page.click('button:has-text("Salvar")');
  await this.page.waitForSelector('[data-sonner-toast]', { timeout: 10000 });
});

When('I click cancel', async function (this: ExamManagerWorld) {
  await this.page.click('button:has-text("Cancelar")');
});

Then('I should see the question bank page', { timeout: 10000 }, async function (this: ExamManagerWorld) {
  await this.page.waitForSelector('text=Banco de Questões', { timeout: 8000 });
});

Then('I should see existing questions listed', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(1000);
  const table = this.page.locator('table');
  const emptyState = this.page.locator('text=Nenhuma questão cadastrada');
  const hasTable = await table.isVisible().catch(() => false);
  const hasEmpty = await emptyState.isVisible().catch(() => false);
  assert.ok(hasTable || hasEmpty, 'Expected either a questions table or empty state');
});

Then('I should see the question creation dialog', async function (this: ExamManagerWorld) {
  await this.page.waitForSelector('#statement', { timeout: 5000 });
  const dialog = this.page.locator('role=dialog');
  assert.ok(await dialog.isVisible(), 'Expected question creation dialog to be open');
});

Then('the dialog should be closed', async function (this: ExamManagerWorld) {
  await this.page.waitForTimeout(500);
  const statement = this.page.locator('#statement');
  const isVisible = await statement.isVisible().catch(() => false);
  assert.ok(!isVisible, 'Expected the question dialog to be closed');
});

Then('I should see the question {string} in the list', { timeout: 10000 }, async function (this: ExamManagerWorld, statement: string) {
  await this.page.waitForSelector(`text=${statement}`, { timeout: 8000 });
});
