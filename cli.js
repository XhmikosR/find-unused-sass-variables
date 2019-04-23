#!/usr/bin/env node

'use strict';

const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { version } = require('./package.json');
const fusv = require('.');

// Colors
const infoClr = chalk.cyan;
const reset = chalk.default;

function processFolders(args, spinner, ignore) {
    return new Promise(resolve => {
        args.forEach(arg => {
            const dir = path.resolve(arg);

            spinner.info(`Finding unused variables in "${infoClr.bold(dir)}"...`);
            spinner.start();

            const unusedVars = fusv.find(dir, { ignore });

            spinner.info(`${infoClr.bold(unusedVars.total)} total variables.`);
            spinner.start();

            unusedVars.unused.forEach(unusedVar => {
                spinner.warn(`Variable ${reset.bold(unusedVar)} is not being used!`);
            });

            spinner.start();
            return resolve(unusedVars);
        });
    });
}

function handleArgs() {
    const args = commander.args.filter(arg => typeof arg === 'string');
    const ignore = commander.ignore ? commander.ignore.split(',') : [];

    if (args.length) {
        const spinner = ora('');

        console.log('Looking for unused variables');
        spinner.start();
        processFolders(args, spinner, ignore)
            .then(unusedVars => {
                if (unusedVars.unused.length === 0) {
                    spinner.succeed('No unused variables found!');
                }

                spinner.stop();
            });
    } else {
        commander.help();
    }
}

commander
    .usage('[options] <folders...>')
    .version(version, '-v, --version')
    .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated')
    .action(handleArgs)
    .parse(process.argv);
