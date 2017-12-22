#!/usr/bin/env node

'use strict';

const path = require('path');
const chalk = require('chalk');
const fusv = require('./index.js');

const args = process.argv.slice(2); // The first and second args are: path/to/node script.js
const log = console.log;
let success = true;

// Colors
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

    log(`Found ${infoClr.bold(unusedVars.total)} total variables.`);

    unusedVars.unused.forEach((unusedVar) => {
        log(chalk`{yellow Variable {reset.bold %s} is not being used!}`, unusedVar);
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
