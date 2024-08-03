/**
 * https://commitlint.js.org/reference/rules.html
 */

const typeEnum = [
	'feature', // new feature
	'fix', // bug fix
	'core', // @deco/core
	'cli', // @deco/cli
	'share', // @deco/share
	'docs', // @deco/docs
	'renderer', // @deco/docs
	'refactor', // code refactor
	'perf', // performance improvement
	'revert', // revert commit
	'test', // new test code
	'chore', // change config file etc.
];

export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [2, 'always', typeEnum],
	},
};
