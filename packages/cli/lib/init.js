import path from 'node:path';
import url from 'node:url';
import inquirer from 'inquirer';
import figlet from 'figlet';
import fs from 'fs-extra';
import { exec } from 'node:child_process';
import ora from 'ora';

const { mkdirp, outputJson, emptyDir, pathExists, copy, readJson } = fs;

class ArgsContext {
	constructor(projectName) {
		this.cwd = process.cwd();
		this.__filename = url.fileURLToPath(import.meta.url);
		this.__dirname = path.dirname(__filename);
		this.projectName = projectName;
		this.projectPath = path.join(this.cwd, projectName);
		this.packageManagerTool = 'npm';
	}
}

function runStartUI() {
	return new Promise((resolve, reject) => {
		figlet('Deco Start !!', function (err, data) {
			if (err) {
				console.log('Something went wrong...');
				console.dir(err);
				return reject(err);
			}
			console.log(data);
			resolve(true);
		});
	});
}
function ensureProjectName() {
	return inquirer
		.prompt([
			{
				type: 'input',
				name: 'projectName',
				message: 'Project name:',
				default: 'deco-project',
			},
		])
		.then((answers) => {
			return answers;
		})
		.catch((error) => {
			if (error.isTtyError) {
				console.error("deco couldn't be rendered in the current environment");
			} else {
				console.error(error);
			}
		});
}

async function ensureProjectPath({ projectPath, projectName }) {
	const execContext = { desc: 'Make project directory', callback: () => {} };

	if (await pathExists(projectPath)) {
		const { action } = await inquirer.prompt({
			type: 'list',
			name: 'action',
			message: `Target directory "${projectName}" is not empty. Please choose how to proceed:`,
			choices: [
				{ name: 'Remove existing files and continue', value: 'overwrite' },
				{ name: 'Cancel operation', value: 'cancel' },
				{ name: 'Ignore files and continue', value: 'skip' },
			],
		});

		switch (action) {
			case 'overwrite':
				execContext.callback = async () => emptyDir(projectPath);
				execContext.desc = 'Removing existing files';
				break;
			case 'skip':
				break;
			case 'cancel':
				return process.exit();
		}
	} else {
		execContext.desc = 'Creating project directory';
		execContext.callback = async () =>
			mkdirp(projectPath).catch((err) => {
				console.error(err);
			});
	}

	return execContext;
}

async function execCopyConfigFile({ projectPath }) {
	// copy ../template/webpack.config.js
	const execContext = {
		desc: 'Create webpack.config.js file',
		callback: (execContext.callback = async () =>
			copy(
				path.join(__dirname, '../template/webpack.config.js'),
				path.join(projectPath, 'webpack.config.js'),
			).catch((err) => {
				console.error('copy package.json file fail');
				console.error(err);
			})),
	};

	return execContext;
}

async function execCreatePackageJson({ projectName, projectPath }) {
	// create ../template/package.json
	const execContext = {
		desc: 'Create package.json file',
		callback: async () => {
			// const targetPackage = await readJson(path.join(__dirname, '../template/package.json'));
			// targetPackage.name = projectName;
			// return outputJson(path.join(projectPath, 'package.json'), targetPackage).catch((err) => {
			// 	console.error('create package.json file fail');
			// 	console.error(err);
			// });
		},
	};
	return execContext;
}

async function execInstall({ packageManagerTool, projectPath }) {
	return {
		desc: 'Install dependencies',
		callback: async () =>
			exec(
				`${packageManagerTool} install`,
				{
					cwd: projectPath,
					shell: true,
					// stdio: 'inherit',
				},
				(error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				},
			),
	};
}

async function ensurePackageManagerTool(argsContext) {
	const { action } = await inquirer.prompt({
		type: 'list',
		name: 'action',
		message: `choose your npm package manage tool:`,
		choices: [
			{ name: 'npm', value: 'npm' },
			{ name: 'yarn', value: 'yarn' },
			{ name: 'pnpm', value: 'pnpm' },
		],
	});

	argsContext.packageManagerTool = action;
}

async function execAll(execQueue, argsContext) {
	const spinner = ora('Loading unicorns');
	try {
		for (const execTask of execQueue) {
			if (!execTask) {
				continue;
			}
			spinner.text(execTask.desc + '...').start();
			await execTask(argsContext);
			spinner.succeed(execTask.desc + ' OK');
		}
	} catch (err) {
		spinner.fail('Fail!! Please check fail log.');
		console.error(err);
	}
}

async function main() {
	await runStartUI();
	const command = await ensureProjectName();

	const { projectName } = command;
	const argsContext = new ArgsContext(projectName);

	const ensureQueue = [
		ensureProjectPath,
		ensurePackageManagerTool,
		execCreatePackageJson,
		execCopyConfigFile,
		execInstall,
	];
	const execQueue = [];
	for (const task of ensureQueue) {
		execQueue.push(await task(argsContext));
	}
	await execAll(execQueue, argsContext);
}

export default main;
