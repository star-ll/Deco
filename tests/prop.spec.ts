import { test, expect } from '@playwright/test';

test.describe('TestWatch Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/#/api/prop'); // 请确保服务器在此运行
	});

	test('init prop', async ({ page }) => {
		// element元素的dom property
		expect(await page.locator('test-prop').evaluate((el) => (el as any).name)).toBe(undefined);
		expect(await page.locator('test-prop').evaluate((el) => (el as any).count)).toBe(1);
	});
});
