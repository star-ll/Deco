const { merge } = require('webpack-merge');
const path = require('path');
const baseWebpackConfig = require('../webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = merge(baseWebpackConfig, {
	entry: './index.ts',
	output: {
		filename: 'main.js',
		path: __dirname + '/dist',
	},
	devServer: {
		port: 8000,
		open: true
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'index.html'),
		}),
	],
});
