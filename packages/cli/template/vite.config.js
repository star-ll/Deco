import decoInjectComponent from "./rollup-plugin-deco-inject.js"

/**
 * @type {import('vite').UserConfig}
 */
const config =  {
    "base": "./",
    plugins: [decoInjectComponent()]
}

export default config