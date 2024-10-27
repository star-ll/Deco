export default {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: '>0.2%, not dead',
			},
		],
	],
	plugins: [
		['@babel/plugin-transform-runtime'],
		['@babel/plugin-proposal-decorators', { version: 'legacy' }]
	],
};
