const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
const path = require('path');
module.exports = {
	mode: 'development',
	entry: './index.ts',
	output: {
		filename: 'main.js',
		path: __dirname + '/dist',
	},
	devServer: {
		port: 8080,
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
						presets: [
							['@babel/preset-env', { }],
						],
						plugins: [
							["@babel/plugin-proposal-decorators", { "version": "2023-11" }],
							[
								"@babel/plugin-transform-react-jsx",
								{
								  "pragma": "__deco_h_", 
								  "pragmaFrag": "__deco_Fragment"
								}
							  ]
						  ]
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
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'index.html'),
		}),
	],
};
