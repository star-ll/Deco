import { defineConfig } from 'vite';
import decoInjectComponent from '@decoco/rollup-plugin-auto-inject-component';
import macros from "@decoco/rollup-plugin-macros"

const config = defineConfig({
	base: './',
	plugins: [macros(),decoInjectComponent(['src/**/*.(tsx|jsx)'])],
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
