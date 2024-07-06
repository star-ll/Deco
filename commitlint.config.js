/**
 * https://commitlint.js.org/reference/rules.html
 */
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feature',
				'fix',
				'docs', 
                'style', 
                'refactor', 
                'perf', 
                'test', 
                'chore'
			],
		],
	},
};
