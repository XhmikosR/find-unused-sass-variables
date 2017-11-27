#!/usr/bin/env node

/*!
 * Script to find unused Sass variables.
 *
 * Copyright 2017, XhmikosR
 * Licensed under the MIT License
 */

'use strict';

const findUnusedVars = require('./src/findUnusedVars');
let globalSuccess = true;

function main(args) {
    if (args.length < 1) {
        console.log('Wrong arguments!');
        console.log('Usage: find-unused-sass-variables folder [, folder2...]');
        process.exit(1);
    }

    args.forEach((arg) => {
        const vars = findUnusedVars(arg, true);

        if (vars.length > 0 && globalSuccess) {
            globalSuccess = false;
        }
    });

    if (globalSuccess === false) {
        process.exit(1);
    }
}

// The first and second args are: path/to/node script.js
main(process.argv.slice(2));
