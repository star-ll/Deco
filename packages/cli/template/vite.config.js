import decoInjectComponent from './rollup-plugin-decoco-inject.js';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
	base: './',
	plugins: [decoInjectComponent()],
	build: {
		rollupOptions: {
			input: './index.ts',
			output: {
				format: 'esm',
				entryFileNames: 'index.js',
			},
		},
	},
};

export default config;
