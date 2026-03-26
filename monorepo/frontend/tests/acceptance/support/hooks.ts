import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { ExamManagerWorld } from './world';

let sharedBrowser: import('playwright').Browser;

BeforeAll({ timeout: 30000 }, async function () {
  sharedBrowser = await chromium.launch({ headless: false });
});

AfterAll({ timeout: 10000 }, async function () {
  await sharedBrowser?.close();
});

Before({ timeout: 15000 }, async function (this: ExamManagerWorld) {
  this.browser = sharedBrowser;
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After({ timeout: 15000 }, async function (this: ExamManagerWorld) {
  await this.context?.close();
});
