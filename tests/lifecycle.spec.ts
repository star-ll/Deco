import { test, expect } from '@playwright/test';

test.describe('TestLifecycle Component', () => {
	test('should trigger lifecycle methods in the correct order', async ({ page }) => {
		const lifecycleLogs: string[] = [];

		//l isten console message
		page.on('console', async (message) => {
			if (message.type() === 'log') {
				lifecycleLogs.push(message.text());

				switch (message.text()) {
					case 'constructor':
						// id=testLifeCycle不存在
						expect(await page.locator('test-lifecycle')).toBeEmpty();
						break;
					case 'componentDidMount':
						// commponent has rendered
						expect(await page.locator('test-lifecycle')).toBeTruthy();
						expect(await page.locator('test-lifecycle').evaluate((el) => (el as any).updateCount)).toBe(1);
						expect(await page.locator('text=updateCount=1')).toBeTruthy();
						break;
					case 'shouldComponentUpdate':
						// state has updated, but not re-render
						expect(await page.locator('test-lifecycle').evaluate((el) => (el as any).updateCount)).toBe(2);
						expect(await page.locator('text=updateCount=1')).toBeTruthy();
						break;
					case 'componentDidUpdate':
						// state has updated and re-render
						expect(await page.locator('test-lifecycle')).toBeTruthy();
						expect(await page.locator('test-lifecycle').evaluate((el) => (el as any).updateCount)).toBe(2);
						expect(await page.locator('text=updateCount=2')).toBeTruthy();
						break;
				}
			}
		});

		await page.goto('http://localhost:5173/#/lifecycycle');
		await page.waitForTimeout(500); // wait for create element

		expect(lifecycleLogs).toEqual(['constructor', 'componentWillMount', 'componentDidMount']);

		// emit update
		await page.evaluate(() => {
			const component = document.querySelector('test-lifecycle') as any;
			component.__updateComponent && component.__updateComponent(); // force update
		});

		await page.waitForTimeout(500); // wait for component udpate

		// check update lifecycle
		expect(lifecycleLogs).toContain('shouldComponentUpdate');
		expect(lifecycleLogs).toContain('componentDidUpdate');
	});
});
