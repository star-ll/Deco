/**
 * https://commitlint.js.org/reference/rules.html
 */

const typeEnum = [
	'feature', // new feature
	'fix', // bug fix
	'refactor', // code refactor
	'perf', // performance improvement
	'revert', // revert commit
	'test', // new test code
	'chore', // change config file etc.
	'ci', // change ci config etc.
	"docs" // change docs
];

export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [2, 'always', typeEnum],
		"subject-case": [0]
	},
};
