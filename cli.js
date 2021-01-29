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
    .parse(process.argv);

function main(args) {
    const ignore = commander.ignore ? commander.ignore.split(',') : [];

    console.log('Looking for unused variables');

    let unusedList = [];

    args.forEach(arg => {
        const dir = path.resolve(arg);

        console.log(`Finding unused variables in "${chalk.cyan.bold(dir)}"...`);

        // eslint-disable-next-line unicorn/no-array-callback-reference
        const unusedVars = fusv.find(dir, { ignore });

        console.log(`${chalk.cyan.bold(unusedVars.total)} total variables.`);
        console.log(`${chalk.cyan.bold(unusedVars.unusedTotal)} total unused variables.`);
        let currentFile = '';
        unusedVars.unusedInfo.forEach(unusedVar => {
            if (currentFile !== unusedVar.filePath) {
                currentFile = unusedVar.filePath;
                console.log(`\n${chalk.underline(currentFile)}`);
            }

            console.log(
                ` ${unusedVar.line}:${unusedVar.column}\t` +
                `Variable ${chalk.bold(unusedVar.name)} is not being used!`
            );
        });

        unusedList = unusedList.concat(unusedVars.unused);
    });

    if (unusedList.length === 0) {
        console.log('No unused variables found!');
        process.exit(0);
    }

    process.exit(1);
}

const args = commander.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main(args);
} else {
    commander.help();
}
