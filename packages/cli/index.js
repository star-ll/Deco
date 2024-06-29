import path from 'node:path';
import url from 'node:url';
import inquirer from 'inquirer';
import figlet from 'figlet';
import fs from 'fs-extra';
import { exec } from 'node:child_process';

const { mkdirp, outputJson, emptyDir, pathExists, copy, readJson } = fs;

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
function runType() {
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

async function main() {
	await runStartUI();
	const command = await runType();

	const cwd = process.cwd();
	const __filename = url.fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const { projectName } = command;
	const projectPath = path.join(cwd, projectName);

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
				await emptyDir(projectPath);
				break;
			case 'skip':
				break;
			case 'cancel':
				return process.exit();
		}
	} else {
		mkdirp(path.join(cwd, projectName)).catch((err) => {
			console.error(err);
		});
	}

	// create ./template/package.json
	const targetPackage = await readJson(path.join(__dirname, './template/package.json'));
	targetPackage.name = projectName;
	await outputJson(path.join(projectPath, 'package.json'), targetPackage).catch((err) => {
		console.error('create package.json file fail');
		console.error(err);
	});

	// copy ./template/webpack.config.js
	await copy(path.join(__dirname, 'template/webpack.config.js'), path.join(projectPath, 'webpack.config.js')).catch(
		(err) => {
			console.error('copy package.json file fail');
			console.error(err);
		},
	);

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

	console.log(projectPath, action);
	exec(
		`${action} install`,
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
	);
}

main();
