import { defineConfig } from 'rollup';

export default defineConfig([
	{
		input: './lib/index.js',
		output: {
			file: './dist/index.esm.js',
			format: 'es',
			sourcemap: true,
		},
	},
	{
		input: './lib/index.js',
		output: {
			file: './dist/index.umd.js',
			format: 'umd',
			name: 'decocoInjectComponent',
			sourcemap: true,
		},
	},
]);
