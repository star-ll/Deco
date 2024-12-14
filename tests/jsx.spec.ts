import { test, expect } from '@playwright/test';

test.describe('test jsx logic with', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/#/renderer/jsx');
		page.evaluate(() => {
			document.body.appendChild(document.createElement('test-jsx-logic-with'));
		});
		await page.waitForTimeout(500);
	});

	test('TestJsxLogicWith - toggle state', async ({ page }) => {
		const button = page.locator('button');
		const resultDiv = page.locator('.result');

		// 初始状态不显示 "show"
		await expect(resultDiv).not.toContainText('show');

		// 点击按钮后显示 "show"
		await button.click();
		await expect(resultDiv).toContainText('show');

		// 再次点击按钮后隐藏 "show"
		await button.click();
		await expect(resultDiv).not.toContainText('show');
	});
});

test.describe('test jsx trinomial operator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/#/renderer/jsx');
		page.evaluate(() => {
			document.body.appendChild(document.createElement('test-jsx-trinomial'));
		});
	});

	test('TestChangeDOM2 - initial state', async ({ page }) => {
		const resultDiv = page.locator('.result');
		const hiddenDiv = page.locator('#b');
		await expect(hiddenDiv).toBeVisible();
		await expect(resultDiv.locator('input.a')).toHaveCount(0);
	});

	test('TestChangeDOM2 - toggle state', async ({ page }) => {
		const button = page.locator('button');
		const resultDiv = page.locator('.result');
		const inputA = page.locator('input.a');
		const hiddenDiv = page.locator('#b');

		// 初始状态显示隐藏的 div
		await expect(hiddenDiv).toBeVisible();
		await expect(resultDiv.locator('input.a')).toHaveCount(0);

		// 点击按钮后显示 input 元素
		await button.click();
		await expect(inputA).toBeVisible();
		await expect(hiddenDiv).not.toBeVisible();

		// 再次点击按钮后显示隐藏的 div
		await button.click();
		await expect(hiddenDiv).toBeVisible();
		await expect(resultDiv.locator('input.a')).toHaveCount(0);
	});
});
