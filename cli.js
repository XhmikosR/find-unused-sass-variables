#!/usr/bin/env node

// Construct the require method
import { createRequire } from 'node:module';
import path from 'node:path';
import { program } from 'commander';
import chalk from 'chalk';
import fusv from './index.js';
// Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

program
    .arguments('[folders]')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated', '')
    .option('-e, --extension [fileTypes...]', 'file extension to search', ['scss'])
    .parse();

async function main() {
    const directories = program.args;
    const programOptions = program.opts();
    const options = {
        ignore: programOptions.ignore.split(','),
        fileExtensions: programOptions.extension
    };

    console.log('Looking for unused variables');

    const executions = await Promise.allSettled(directories.map(path => executeForPath(path, options)));

    let status = 0;

    for (const result of executions) {
        if (result.status === 'rejected') {
            console.log(chalk.redBright(result.reason));
            status = 1;
        }
    }

    process.exit(status);
}

const executeForPath = async(arg, options) => {
    const dir = path.resolve(arg);
    const unusedVars = await fusv.findAsync(dir, options);

    console.log(`Searching for unused variables in "${chalk.cyan.bold(dir)}" folder, ${chalk.cyan.bold(options.fileExtensions.join(', '))} files...`);
    console.log(`${chalk.cyan.bold(unusedVars.total)} total variables.`);

    if (unusedVars.unused.length > 0) {
        console.log(`${chalk.yellowBright.bold(unusedVars.unused.length)} are not used!`);
        for (const unusedVar of unusedVars.unused) {
            console.log(`Variable ${chalk.red(unusedVar)} is not being used!`);
        }
    } else {
        console.log(chalk.greenBright(`No unused variables found in "${dir}!`));
    }
};

const args = program.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main();
} else {
    program.help();
}
