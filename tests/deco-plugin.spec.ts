import { test, expect } from '@playwright/test';

test.describe('deco-plugin', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/#/deco-plugins/global-style');
	});

	test('test-global-style-plugin', async ({ page }) => {
		await expect(page.locator('test-global-style div').first()).toHaveCSS('color', 'rgb(255, 0, 0)'); // red
		await expect(page.locator('test-global-style div.blue').first()).toHaveCSS('color', 'rgb(0, 0, 255)'); // blue
	});
});
