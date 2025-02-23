import { defineConfig } from 'vite';
import macros from "@decoco/rollup-plugin-macros"


const config = defineConfig({
	base: './',
	plugins: [macros()],
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
