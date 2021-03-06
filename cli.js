#!/usr/bin/env node

'use strict';

const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const { version } = require('./package.json');
const fusv = require('.');

commander
    .usage('[options] <folders...>')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated')
    .option('-c, --combine [isCombineDirs]', 'combine directories')
    .parse(process.argv);

const ignore = commander.ignore ? commander.ignore.split(',') : [];
const combine = commander.combine ? commander.combine : false;

function main(args) {
    let unusedListing = [];

    console.log('Looking for unused variables');

    if (combine === true) {
        unusedListing = getUnunsedVar(args);
    } else {
        args.forEach(arg => {
            const dir = path.resolve(arg);
            unusedListing = getUnunsedVar(dir);
        });
    }

    if (unusedListing.length === 0) {
        console.log('No unused variables found!');
        process.exit(0);
    }

    process.exit(1);
}

function getUnunsedVar(argVal) {
    const unusedList = [];

    console.log(`Finding unused variables in "${chalk.cyan.bold(argVal)}"...`);

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const unusedVars = fusv.find(argVal, { ignore, combine });

    console.log(`${chalk.cyan.bold(unusedVars.total)} total variables.`);

    unusedVars.unused.forEach(unusedVar => {
        console.log(`Variable ${chalk.bold(unusedVar)} is not being used!`);
    });

    // eslint-disable-next-line unicorn/prefer-spread
    [unusedList].concat(unusedVars.unused);

    return unusedList;
}

const args = commander.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main(args);
} else {
    commander.help();
}
