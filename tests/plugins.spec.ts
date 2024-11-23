import { test, expect } from '@playwright/test';

test.describe('test-auto-inject-plugin', () => {
	test.beforeEach(async ({ page }) => {
		page.goto('http://localhost:5173/#/plugins/auto-inject');
	});

	test('test base case', async ({ page }) => {
		// test plugin work
		await expect(page.locator('text=/^test-a$/')).toBeVisible();
		await expect(page.locator('text=/^test-a-two$/')).toBeVisible();
		await expect(page.locator('text=/^test-b$/')).toBeVisible();
	});
});
