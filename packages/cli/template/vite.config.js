import decoInjectComponent from "./rollup-plugin-decoco-inject.js"

/**
 * @type {import('vite').UserConfig}
 */
const config =  {
    "base": "./",
    plugins: [decoInjectComponent()]
}

export default config