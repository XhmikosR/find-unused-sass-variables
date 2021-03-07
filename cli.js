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

    const results = Promise.all(args.map(path => executeForPath(path, ignore)));

    results.catch(error => {
        console.log(chalk.redBright(error.message));
        process.exit(1);
    });

    results.then(results => {
        results.forEach(result => {
            unusedList = [...unusedList, ...result];
        });
    });

    results.then(() => showResults(unusedList.length));
}

const showResults = (unusedCount = 0) => {
    if (unusedCount > 0) {
        console.log(chalk.redBright(`${unusedCount} unused variables found`));
        process.exit(1);
    }

    console.log(chalk.greenBright('No unused variables found!'));
    process.exit(0);
};

const executeForPath = (arg, ignore) => {
    return new Promise(resolve => {
        const dir = path.resolve(arg);

        console.log(`Finding unused variables in "${chalk.cyan.bold(dir)}"...`);

        // eslint-disable-next-line unicorn/no-array-callback-reference
        const unusedVars = fusv.find(dir, { ignore });

        console.log(`${chalk.cyan.bold(unusedVars.total)} total variables.`);

        if (unusedVars.unused.length > 0) {
            console.log(`${chalk.yellowBright.bold(unusedVars.unused.length)} are not used!`);
        }

        unusedVars.unused.forEach(unusedVar => {
            console.log(`Variable ${chalk.red(unusedVar)} is not being used!`);
        });

        resolve(unusedVars.unused);
    });
};

const args = commander.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main(args);
} else {
    commander.help();
}
