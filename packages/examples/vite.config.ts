import { defineConfig } from 'vite';
import decoInjectComponent from '@decoco/rollup-plugin-auto-inject-component';
import dts from "@decoco/rollup-plugin-dts"

const config = defineConfig({
	base: './',
	plugins: [dts(),decoInjectComponent(['src/**/*.(tsx|jsx)'])],
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
