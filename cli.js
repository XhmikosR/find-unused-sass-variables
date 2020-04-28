#!/usr/bin/env node

'use strict';

const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { version } = require('./package.json');
const fusv = require('.');

commander
    .usage('[options] <folders...>')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated')
    .parse(process.argv);

function main(args) {
    const ignore = commander.ignore ? commander.ignore.split(',') : [];
    const spinner = ora('');

    console.log('Looking for unused variables');
    spinner.start();

    let unusedList = [];

    args.forEach(arg => {
        const dir = path.resolve(arg);

        spinner.info(`Finding unused variables in "${chalk.cyan.bold(dir)}"...`);
        spinner.start();

        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
        const unusedVars = fusv.find(dir, { ignore });

        spinner.info(`${chalk.cyan.bold(unusedVars.total)} total variables.`);
        spinner.start();

        unusedVars.unused.forEach(unusedVar => {
            spinner.fail(`Variable ${chalk.bold(unusedVar)} is not being used!`);
        });

        unusedList = unusedList.concat(unusedVars.unused);
        spinner.start();
    });

    if (unusedList.length === 0) {
        spinner.succeed('No unused variables found!');
        spinner.stop();
        process.exit(0);
    }

    spinner.stop();
    process.exit(1);
}

const args = commander.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main(args);
} else {
    commander.help();
}
