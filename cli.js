#!/usr/bin/env node

'use strict';

const path = require('path');
const fusv = require('./index');

// The first and second args are: path/to/node script.js
const args = process.argv.slice(2);

let success = true;

if (args.length < 1) {
    console.log('Wrong arguments!');
    console.log('Usage: find-unused-sass-variables folder [, folder2...]');
    process.exit(1);
}

args.forEach((arg) => {
    const dir = path.resolve(arg);

    console.log(`Finding unused variables in "${dir}"...`);

    const unusedVars = fusv.find(dir);

    console.log(`There's a total of ${unusedVars.total} variables.`);

    unusedVars.unused.forEach((unusedVar) => {
        console.log(`Variable "${unusedVar}" is only used once!`);
    });

    if (unusedVars.unused.length > 0) {
        success = false;
    } else {
        console.log('No unused variables found!');
    }
});

if (success === false) {
    process.exit(1);
}
