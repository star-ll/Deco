import * as path from 'path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
	root: path.join(__dirname, 'docs'),
	base: '/Deco/',
	title: 'Decoco',
	description: 'An efficient Web Component framework based on decorator-driven development',
	icon: '/rspress-icon.png',
	logo: {
		light: '/rspress-light-logo.png',
		dark: '/rspress-dark-logo.png',
	},
	themeConfig: {
		socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/star-ll/Deco' }],
	},
});
