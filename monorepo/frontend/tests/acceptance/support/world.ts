import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';

export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
export const API_URL = process.env.API_URL ?? 'http://localhost:3002';
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'dev-api-key';
export const TOKEN_KEY = 'exam_manager_token';

export class ExamManagerWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(`${FRONTEND_URL}${path}`);
  }

  async loginViaApi(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error(`Login API failed: ${response.status}`);

    const { data } = await response.json() as { data: { accessToken: string } };

    await this.page.goto(`${FRONTEND_URL}/login`);
    await this.page.evaluate(
      ({ key, token }: { key: string; token: string }) => {
        localStorage.setItem(key, token);
      },
      { key: TOKEN_KEY, token: data.accessToken },
    );
  }

  async loginViaUI(email: string, password: string): Promise<void> {
    await this.navigateTo('/login');
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(`${FRONTEND_URL}/dashboard`, { timeout: 10000 });
  }
}

setWorldConstructor(ExamManagerWorld);
