#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { version } = require('./package.json');
const fusv = require('.');

program
    .arguments('[options] <folders...>')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated', '')
    .option('-e, --extension <fileType>', 'file extension to search', 'scss')
    .parse(process.argv);

function main() {
    const directories = program.args;
    const options = {
        ignore: program.opts().ignore.split(','),
        fileExtension: program.opts().extension
    };

    console.log('Looking for unused variables');

    let unusedList = [];

    const results = Promise.all(directories.map(path => executeForPath(path, options)));

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

const executeForPath = (arg, options) => {
    return new Promise(resolve => {
        const dir = path.resolve(arg);

        console.log(`Searching unused variables in ${chalk.cyan.bold(options.fileExtension)} files. Search dir "${chalk.cyan.bold(dir)}"...`);

        // eslint-disable-next-line unicorn/no-array-callback-reference
        const unusedVars = fusv.find(dir, options);

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

const args = program.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
    main();
} else {
    program.help();
}
