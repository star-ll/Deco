import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
// import esbuild, { minify } from 'rollup-plugin-esbuild'
import externals from 'rollup-plugin-node-externals'

const usePreferConst = true // Use "const" instead of "var"
const usePreserveModules = false // `true` -> keep modules structure, `false` -> combine everything into a single file
const useStrict = true // Use "strict"
const useThrowOnError = true // On error throw and exception
const useSourceMap = true // Generate source map files
// const useEsbuild = true // `true` -> use esbuild, `false` use tsc

export default [
  {
    // .d.ts build
    input: 'index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [externals(), dts()]
  },
  {
    // UMD build
    input: 'index.ts',
    output: {
      dir: 'dist/umd',
      name: "decoRenderer",
      format: 'umd',
      generatedCode: {
        constBindings: usePreferConst
      },
      preserveModules: usePreserveModules,
      strict: useStrict,
      entryFileNames: '[name].js',
      sourcemap: useSourceMap
    },
    plugins: [
      externals(),
      typescript({
        noEmitOnError: useThrowOnError,
        outDir: 'dist/umd',
        removeComments: true
      })
    ]
  },
  {
    // ESM builds
    input: 'index.ts',
    output: {
      dir: 'dist/esm',
      format: 'es',
      generatedCode: {
        constBindings: usePreferConst
      },
      preserveModules: usePreserveModules,
      strict: useStrict,
      entryFileNames: '[name].js',
      sourcemap: useSourceMap
    },
    plugins: [
      externals(),
      typescript({
          noEmitOnError: useThrowOnError,
          outDir: 'dist/esm',
          removeComments: true
        })
    ]
  },

]