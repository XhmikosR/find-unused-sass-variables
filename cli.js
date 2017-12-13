#!/usr/bin/env node

'use strict';

const path = require('path');
const fusv = require('./index.js');
const chalk = require('chalk');

// The first and second args are: path/to/node script.js
const args = process.argv.slice(2);

let success = true;

const log = console.log;

// colors
const errorClr = chalk.red.bold;
const infoClr = chalk.cyan;
const successClr = chalk.green;

if (args.length < 1) {
    log(errorClr('Wrong arguments!'));
    log('Usage: find-unused-sass-variables folder [, folder2...]');
    process.exit(1);
}

args.forEach((arg) => {
    const dir = path.resolve(arg);

    log(`Finding unused variables in "${infoClr.bold(dir)}"...`);

    const unusedVars = fusv.find(dir);

    log(`There's a total of ${infoClr.bold(unusedVars.total)} variables.`);

    unusedVars.unused.forEach((unusedVar) => {
        log(chalk`{yellow Variable {reset.bold %s} is only used once!}`, unusedVar);
    });

    if (unusedVars.unused.length > 0) {
        success = false;
    } else {
        log(successClr('No unused variables found!'));
    }
});

if (success === false) {
    process.exit(1);
}
