#!/usr/bin/env node

'use strict';

const fusv = require('./index');

let globalSuccess = true;

function main(args) {
    if (args.length < 1) {
        console.log('Wrong arguments!');
        console.log('Usage: find-unused-sass-variables folder [, folder2...]');
        process.exit(1);
    }

    args.forEach((arg) => {
        const vars = fusv.find(arg, true);

        if (vars.length > 0) {
            globalSuccess = false;
        } else {
            console.log(`No unused variables found in "${arg}".`);
        }
    });

    if (globalSuccess === false) {
        process.exit(1);
    }
}

// The first and second args are: path/to/node script.js
main(process.argv.slice(2));
