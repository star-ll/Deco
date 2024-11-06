import { defineConfig } from 'vite';
import decoInjectComponent from './rollup-plugin-decoco-inject.js';

const config = defineConfig({
	base: './',
	plugins: [decoInjectComponent()],
	build: {
		lib: {
			entry: './index.ts',
			name: 'decoco',
			fileName: 'index',
			formats: ['es', 'umd'],
		},
	},
});

export default config;
