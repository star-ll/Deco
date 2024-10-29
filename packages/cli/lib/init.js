#!/usr/bin/env node

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
		this.__dirname = path.dirname(this.__filename);
		this.projectName = projectName;
		this.projectPath = path.join(this.cwd, projectName);
		this.packageManagerTool = 'npm';
	}
}

function runStartUI() {
	return new Promise((resolve, reject) => {
		figlet('decoco Start !!', function (err, data) {
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
				default: 'decoco-project',
			},
		])
		.then((answers) => {
			return answers;
		})
		.catch((error) => {
			if (error.isTtyError) {
				console.error("decoco couldn't be rendered in the current environment");
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

async function execInstall({ packageManagerTool, projectPath }) {
	return new Promise((resolve, reject) => {
		const spinner = ora(`${packageManagerTool} install...`).start();

		exec(
			`${packageManagerTool} upgrade`,
			{
				cwd: projectPath,
				shell: true,
				// stdio: [process.stdin, process.stdout, process.stderr],
			},
			(err, stdout, stderr) => {
				if (err) {
					console.error(err);
					spinner.fail(
						`${packageManagerTool} install fail\nPlease run command manually: ${packageManagerTool} upgrade`,
					);
					return reject(err);
				}
				if (stderr) {
					console.error(stderr);
				}

				spinner.succeed(`${packageManagerTool} install OK`);
				console.log('\n' + stdout);
				resolve();
			},
		);
	});
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
async function execCopyAllFiles(argsContext) {
	const spinner = ora('Copy all files...').start();
	try {
		await fs.ensureDir(argsContext.projectPath);
		await fs.copy(path.join(argsContext.__dirname, '../template'), argsContext.projectPath);

		{
			// update package.json
			const packageJsonPath = path.join(argsContext.projectPath, 'package.json');
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			let packageJson = JSON.parse(packageJsonContent);

			packageJson.name = argsContext.projectName;
			await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
		}

		spinner.succeed('Copy all files OK');
	} catch (error) {
		console.error('copy	error:', error);
		spinner.fail('Copy all files fail');
	}
}

async function finnalyTip(argsContext) {
	console.log(`\n\n\nPlease run: cd ${argsContext.projectName} && ${argsContext.packageManagerTool} run dev\n\n\n`);
}

async function main() {
	await runStartUI();
	const command = await ensureProjectName();

	const { projectName } = command;
	const argsContext = new ArgsContext(projectName);

	const ensureQueue = [ensureProjectPath, ensurePackageManagerTool, execCopyAllFiles, execInstall, finnalyTip];

	for (const execTask of ensureQueue) {
		await execTask(argsContext);
	}
}

export default main;
