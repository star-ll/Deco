const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
	mode: 'development',
	entry: './index.ts',
	output: {
		filename: 'main.js',
		path: __dirname + '/dist',
	},
	devServer: {
		port: 8000,
		open: true,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
		alias: {
			'@deco/core': path.join(__dirname, '../dist/esm/index.js'),
		},
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'css-loader',
					},
					{
						loader: 'less-loader',
					},
				],
			},
			{
				test: /\.(?:js|mjs|cjs|jsx|tsx|ts)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', {}]],
						plugins: [
							['@babel/plugin-proposal-decorators', { version: '2023-11' }],
							[
								'@babel/plugin-transform-react-jsx',
								// {
								// 	"pragma": "__deco_h_",
								// 	"pragmaFrag": "__deco_Fragment"
								// }
							],
						],
					},
				},
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'index.html'),
		}),
	],
};
