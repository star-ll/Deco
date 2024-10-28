import { test, expect } from '@playwright/test';

/**
 * test case
 * [1, 2, 3, 4, 5]
 */

test.describe('TestDiff Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/#/renderer/diff');
		page.waitForSelector('#testContainer');
		await page.click('text=reset');
	});

	// 1. reset to [1, 2, 3, 4, 5]
	test('reset button should reset the array to [1, 2, 3, 4, 5]', async ({ page }) => {
		await page.click('text=reset');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['1', '2', '3', '4', '5']);
		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['1', '2', '3', '4', '5']);
	});

	// (-1, 0) 1, 2, 3, 4, 5
	test('simpleAddItemInStart button should add items at the start', async ({ page }) => {
		await page.click('text=simpleAddItemInStart');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['-1', '0', '1', '2', '3', '4', '5']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual([null, null, '1', '2', '3', '4', '5']);
	});

	// 1, 2, 3, 4, 5, (6, 7)
	test('simpleAddItemInEnd button should add items at the end', async ({ page }) => {
		await page.click('text=simpleAddItemInEnd');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['1', '2', '3', '4', '5', '6', '7']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['1', '2', '3', '4', '5', null, null]);
	});

	// 1, 2, (-1), 3, 4, 5
	test('simpleAddItemInMiddle button should add an item in the middle', async ({ page }) => {
		await page.click('text=simpleAddItemInMiddle');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['1', '2', '-1', '3', '4', '5']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['1', '2', null, '3', '4', '5']);
	});

	// [1], 2, 3, 4, 5
	test('simpleDeleteItemInStart button should delete an item in the start', async ({ page }) => {
		await page.click('text=simpleDeleteItemInStart');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['2', '3', '4', '5']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['2', '3', '4', '5']);
	});

	// 1, 2, 3, 4, [5]
	test('simpleDeleteItemInEnd button should delete an item in the end', async ({ page }) => {
		await page.click('text=simpleDeleteItemInEnd');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['1', '2', '3', '4']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['1', '2', '3', '4']);
	});

	// 1, 2, [3], 4, 5
	test('simpleDeleteInMiddle button should delete an item in the middle', async ({ page }) => {
		await page.click('text=simpleDeleteInMiddle');
		const items = await page.locator('#testContainer span').allTextContents();
		expect(items).toEqual(['1', '2', '4', '5']);

		expect(
			await page
				.locator('#testContainer span')
				.evaluateAll((spans) => spans.map((span) => span.getAttribute('data-origin-item'))),
		).toEqual(['1', '2', '4', '5']);
	});
});
