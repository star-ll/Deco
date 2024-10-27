import {babel} from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
// import esbuild, { minify } from 'rollup-plugin-esbuild'
import externals from 'rollup-plugin-node-externals';

const usePreferConst = true; // Use "const" instead of "var"
const useStrict = true; // Use "strict"
// const useEsbuild = true // `true` -> use esbuild, `false` use tsc

/**
 *
 * @param {boolean} isProd Is in production mode?
 * @param {string} moduleType module type
 * @returns {Object} rollup plugin list
 */
function getPlugins(isProd, moduleType){
  const plugins = [
    externals(),
    typescript(),
    babel({
      exclude: ['node_modules/**'],
      babelHelpers: 'runtime',
    }),
  ]

  if(isProd){
    plugins.push(terser())
  }

  return plugins
}

const isProduction = process.env.Production

const config =  [
  {
    // .d.ts build
    input: 'index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [externals(), dts()],
  },
  {
    // UMD development
    input: 'index.ts',
    output: {
      dir: 'dist',
      name: 'decoco',
      format: 'umd',
      strict: useStrict,
      entryFileNames: 'index.umd.dev.js',
      sourcemap: false,
      globals:{
        "@decoco/renderer": 'decoRenderer'
      }
    },
    plugins: getPlugins(false, 'umd'),
  },
  {
    // ESM development
    input: 'index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      strict: useStrict,
      entryFileNames: 'index.esm.dev.js',
      sourcemap: false,
    },
    plugins: getPlugins(false, 'esm'),
  },
]

if(isProduction){
  config.push(...[
    {
      // UMD production
      input: 'index.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'index.umd.prod.js',
        name: 'decoco',
        format: 'umd',
        generatedCode: {
          constBindings: usePreferConst,
        },
        preserveModules: false,
        strict: useStrict,
        sourcemap: true,
        globals:{
          "@decoco/renderer": 'decoRenderer'
        }
      },
      plugins: getPlugins(true, 'umd'),
    },
    {
      // ESM production
      input: 'index.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'index.esm.prod.js',
        format: 'es',
        generatedCode: {
          constBindings: usePreferConst,
        },
        strict: useStrict,
        sourcemap: true,
      },
      plugins: getPlugins(true, 'esm'),
    },
  ])
}

export default config
