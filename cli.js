#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { version } = require('./package.json');
const fusv = require('.');

program
    .arguments('[folders]')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated', '')
    .parse();

async function main() {
    const directories = program.args;
    const ignore = program.opts().ignore.split(',');

    console.log('Looking for unused variables');

    const executions = await Promise.allSettled(directories.map(path => executeForPath(path, ignore)));

    let status = 0;

    for (const result of executions) {
        if (result.status === 'rejected') {
            console.log(chalk.redBright(result.reason));
            status = 1;
        }
    }

    process.exit(status);
}

const executeForPath = async(arg, ignore) => {
    const dir = path.resolve(arg);
    const unusedVars = await fusv.findAsync(dir, { ignore });

    console.log(`Finding unused variables in "${chalk.cyan.bold(dir)}"...`);
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
