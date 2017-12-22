#!/usr/bin/env node

'use strict';

const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const fusv = require('./index.js');

const args = process.argv.slice(2); // The first and second args are: path/to/node script.js
const log = console.log;
let success = true;

// Colors
const errorClr = chalk.red.bold;
const infoClr = chalk.cyan;
const reset = chalk.default;

if (args.length < 1) {
    log(errorClr('Wrong arguments!'));
    log('Usage: find-unused-sass-variables folder [, folder2...]');
    process.exit(1);
}

log('Looking for unused variables');
const spinner = ora('').start();

args.forEach((arg) => {
    const dir = path.resolve(arg);

    spinner.info(`Finding unused variables in "${infoClr.bold(dir)}"...`);

    const unusedVars = fusv.find(dir);

    spinner.info(`${infoClr.bold(unusedVars.total)} total variables.`);

    unusedVars.unused.forEach((unusedVar) => {
        spinner.warn(chalk.yellow(`Variable ${reset.bold(unusedVar)} is not being used!`));
    });

    if (unusedVars.unused.length > 0) {
        success = false;
    } else {
        spinner.succeed('No unused variables found!');
    }
});

spinner.stop();

if (success === false) {
    process.exit(1);
}
