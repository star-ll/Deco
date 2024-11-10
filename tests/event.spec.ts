import { test, expect } from '@playwright/test';

test('button click triggers event and updates the text', async ({ page }) => {
	// 1. 访问页面，假设页面已经包含了 EmitEventTest 组件
	await page.goto('http://localhost:5173/#/renderer/event');

	// 2. 获取按钮和结果元素
	const button1 = await page.locator('button:has-text("onTestEvent")');
	const button2 = await page.locator('button:has-text("onTestEventCapture")');
	const button3 = await page.locator('button:has-text("on-test-event")');
	const button4 = await page.locator('button:has-text("on-test-event-capture")');
	const result = await page.locator('.result');

	// 3. 点击 "onTestEvent" 按钮，并验证文本更新
	await button1.click();
	await expect(result).toHaveText('onTestEvent ok'); // 确保文本更新为 "onTestEvent ok"

	// 4. 点击 "onTestEventCapture" 按钮，并验证文本更新
	await button2.click();
	await expect(result).toHaveText('onTestEventCapture ok'); // 确保文本更新为 "onTestEventCapture ok"

	// 5. 点击 "on-test-event" 按钮，并验证文本更新
	await button3.click();
	await expect(result).toHaveText('test-event ok'); // 确保文本更新为 "test-event ok"

	// 6. 点击 "on-test-event-capture" 按钮，并验证文本更新
	await button4.click();
	await expect(result).toHaveText('test-event-capture ok'); // 确保文本更新为 "test-event-capture ok"
});

test('event listener should capture event in capture phase', async ({ page }) => {
	// 1. 访问页面
	await page.goto('http://localhost:5173/#/renderer/event');

	// 2. 获取按钮和结果元素
	const button2 = await page.locator('button:has-text("onTestEventCapture")');
	const result = await page.locator('.result');

	// 3. 点击 "onTestEventCapture" 按钮，并验证文本更新
	await button2.click();
	await expect(result).toHaveText('onTestEventCapture ok'); // 验证在捕获阶段触发的事件更新文本
});

test('event listener should trigger the correct event', async ({ page }) => {
	// 1. 访问页面
	await page.goto('http://localhost:5173/#/renderer/event');

	// 2. 获取按钮和结果元素
	const button1 = await page.locator('button:has-text("onTestEvent")');
	const result = await page.locator('.result');

	// 3. 点击按钮，触发事件，并验证文本更新
	await button1.click();
	await expect(result).toHaveText('onTestEvent ok'); // 验证文本更新为 "onTestEvent ok"
});

test('multiple events can be triggered and update text', async ({ page }) => {
	// 1. 访问页面
	await page.goto('http://localhost:5173/#/renderer/event');

	// 2. 获取按钮和结果元素
	const button1 = await page.locator('button:has-text("onTestEvent")');
	const button2 = await page.locator('button:has-text("onTestEventCapture")');
	const button3 = await page.locator('button:has-text("on-test-event")');
	const button4 = await page.locator('button:has-text("on-test-event-capture")');
	const result = await page.locator('.result');

	// 3. 顺序点击按钮，并验证文本更新
	await button1.click();
	await expect(result).toHaveText('onTestEvent ok'); // 第一个事件的文本
	await button2.click();
	await expect(result).toHaveText('onTestEventCapture ok'); // 第二个事件的文本
	await button3.click();
	await expect(result).toHaveText('test-event ok'); // 第三个事件的文本
	await button4.click();
	await expect(result).toHaveText('test-event-capture ok'); // 第四个事件的文本
});
