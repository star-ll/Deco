/**
 * https://commitlint.js.org/reference/rules.html
 */

const typeEnum = [
	'feature',
	'fix',
	'cli',
	'share',
	'docs',
	'renderer',
	'perf',
	'refactor',
	'perf',
	'revert',
	'test',
	'chore',
];

export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [2, 'always', typeEnum],
	},
};
