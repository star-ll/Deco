import { test, expect } from '@playwright/test';

test('TestBaseStore and TestBaseStoreChild count updates correctly', async ({ page }) => {
	await page.goto('http://localhost:5173/#/api/store');

	// 获取页面上的元素
	const parentCountText = page.locator('text=parent count:1');
	const childCountText = page.locator('text=child count:1');
	const parentButton = page.locator('text=changeCountFromParent');
	const childButton = page.locator('text=changeCountFromChild');

	// 验证初始状态
	await expect(parentCountText).toBeVisible();
	await expect(childCountText).toBeVisible();

	// 点击第一个按钮
	await parentButton.click();

	// 验证点击后状态
	await expect(page.locator('text=parent count:2')).toBeVisible();
	await expect(page.locator('text=child count:2')).toBeVisible();

	// 点击第二个按钮
	await childButton.click();

	// 验证点击后状态
	await expect(page.locator('text=parent count:3')).toBeVisible();
	await expect(page.locator('text=child count:3')).toBeVisible();
});
