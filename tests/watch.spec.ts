import { test, expect } from '@playwright/test';

test.describe('TestWatch Component', () => {
	test.beforeEach(async ({ page }) => {
		// 打开测试页面
		await page.goto('http://localhost:5173/#/api/watch'); // 请确保服务器在此运行
		// 注入并创建组件
		await page.evaluate(() => {
			const component = document.createElement('test-watch-all');
			document.body.appendChild(component);
		});
	});

	test('should trigger watch on each button click from right to left', async ({ page }) => {
		const logMessages: string[] = [];

		// 监听控制台输出
		page.on('console', (message) => {
			if (message.type() === 'log') {
				logMessages.push(message.text());
			}
		});

		// 按钮从右到左点击
		await page.click('button:nth-of-type(4)'); // change this.person.children[0].name
		await page.click('button:nth-of-type(3)'); // change this.person.children[0]
		await page.click('button:nth-of-type(2)'); // change this.person.name
		await page.click('button:nth-of-type(1)'); // change this.person

		// 验证每次点击都触发了监听
		expect(logMessages.length).toBe(4);
		expect(logMessages).toEqual([
			'baby-change baby',
			'baby-change baby-change',
			'Juk-change Juk',
			'Juk-change Juk-change',
		]);
	});

	test('should trigger watch only on the first button click from left to right', async ({ page }) => {
		const logMessages: string[] = [];

		// 监听控制台输出
		page.on('console', (message) => {
			if (message.type() === 'log') {
				logMessages.push(message.text());
			}
		});

		// 按钮从左到右点击
		await page.click('button:nth-of-type(1)'); // change this.person
		await page.click('button:nth-of-type(2)'); // change this.person.name
		await page.click('button:nth-of-type(3)'); // change this.person.children[0]
		await page.click('button:nth-of-type(4)'); // change this.person.children[0].name

		// 验证只触发了一次监听
		expect(logMessages.length).toBe(1);
		expect(logMessages[0]).toBe('Juk-change Juk');
	});
});
