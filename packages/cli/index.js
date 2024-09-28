#!/usr/bin/env node

import init from "./lib/init.js"
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import { Command } from 'commander';

// const cwd = process.cwd();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { version, description, name } = await fs.readJson(path.join(__dirname, './package.json'));
const program = new Command();

program.name(name).description(description).version(version);

program
	.command('init')
	.description('Initialize a decoco project')
	.action((str, options) => {
		init()
	});

program.parse();
