import { test, expect } from '@playwright/test';

test.describe('Computed Decorator Tests', () => {
	test.beforeEach(async ({ page }) => {
		// 假设我们的测试页面在这个路径
		await page.goto('http://localhost:5173/#/api/computed');
	});

	test('should display initial computed value', async ({ page }) => {
		// 初始状态下，value 为 0
		const computedValue = await page.locator('test-computed div').first().textContent();
		expect(computedValue).toContain('value is 0');
	});

	test('should update computed value when state changes', async ({ page }) => {
		// 点击按钮增加 value
		await page.locator('button:has-text("state.value++")').click();

		// 等待更新
		await page.waitForTimeout(100);

		// 检查计算属性是否更新
		const computedValue = await page.locator('test-computed div').first().textContent();
		expect(computedValue).toContain('value is 1');
	});

	test('should update computed value when list is populated', async ({ page }) => {
		// 等待列表初始化（1秒后）
		await page.waitForTimeout(1100);

		// 此时应该显示 list index is 0
		const computedValue = await page.locator('test-computed div').first().textContent();
		expect(computedValue).toContain('list index is 0');
	});

	test('should handle multiple state updates correctly', async ({ page }) => {
		// 等待列表初始化
		await page.waitForTimeout(1100);

		// 连续点击三次
		await page.locator('button:has-text("state.value++")').click();
		await page.locator('button:has-text("state.value++")').click();
		await page.locator('button:has-text("state.value++")').click();

		// 等待更新
		await page.waitForTimeout(100);

		// 检查最终值是否正确（应该显示 list index is 3）
		const computedValue = await page.locator('test-computed div').first().textContent();
		expect(computedValue).toContain('list index is 3');
	});

	test('should cache computed value and not recompute unnecessarily', async ({ page }) => {
		// 获取计算属性的值两次
		await page.locator('button:has-text("getComputedValue")').click();
		await page.locator('button:has-text("getComputedValue")').click();

		// 检查实际计算次数
		const computeCount = await page.evaluate(() => (window as any).computeCount);
		// 由于缓存机制，应该只计算了一次
		expect(computeCount).toBe(1);
	});

	test('should update state.value when setting computedValue', async ({ page }) => {
		await page.waitForSelector('test-computed');

		await page.click('button:text("change computedValue")');

		const stateValueText = await page.textContent('div:text-matches("state.value:")');
		expect(stateValueText).toContain('1');

		const computedValueText = await page.textContent('div:text-matches("computedValue:")');
		expect(computedValueText).toContain('value is 1');

		await page.click('button:text("change computedValue")');

		const stateValueText2 = await page.textContent('div:text-matches("state.value:")');
		expect(stateValueText2).toContain('2');

		const computedValueText2 = await page.textContent('div:text-matches("computedValue:")');
		expect(computedValueText2).toContain('value is 2');
	});

	test('computedValue setter should handle different input values', async ({ page }) => {
		await page.waitForSelector('test-computed');

		// 测试不同的输入值
		const testValues = ['5', '0', '9'];

		for (const value of testValues) {
			// 模拟直接设置 computedValue
			await page.evaluate((val) => {
				const element = document.querySelector('test-computed');
				if (element) {
					(element as any).computedValue = val;
				}
			}, value);

			// 验证 state.value 是否正确更新
			const stateValueText = await page.textContent('div:text-matches("state.value:")');
			expect(stateValueText).toContain(value);
		}
	});
});
