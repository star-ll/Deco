import { defineConfig } from 'vite';
import decoInjectComponent from '@decoco/rollup-plugin-auto-inject-component';
import macors from "@decoco/rollup-plugin-macors"

const config = defineConfig({
	base: './',
	plugins: [macors(),decoInjectComponent(['src/**/*.(tsx|jsx)'])],
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
