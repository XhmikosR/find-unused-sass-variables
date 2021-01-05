'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const defaultOptions = {
    ignore: [],
    combine: false
};

function findUnusedVars(strDir, opts) {
    const options = Object.assign(defaultOptions, opts);

    // Trim list of ignored variables
    options.ignore = options.ignore.map(val => val.trim());

    if (Boolean(options.ignore) && !Array.isArray(options.ignore)) {
        throw new TypeError('`ignore` should be an Array');
    }

    let sassFiles;
    if (options.combine === true) {
        const sassFile = [];
        strDir.forEach((strPath, i) => {
            sassFile[i] = getPath(strPath);
            sassFiles = [].concat(...sassFile);
        });
    } else {
        sassFiles = getPath(strDir);
    }

    // Array of all Sass files
    // String of all Sass files' content
    let sassFilesString = sassFiles.reduce((sassStr, file) => {
        sassStr += fs.readFileSync(file, 'utf8');
        return sassStr;
    }, '');

    // Remove jekyll comments
    if (sassFilesString.includes('---')) {
        sassFilesString = sassFilesString.replace(/---/g, '');
    }

    const variables = parse(sassFilesString, options.ignore);

    // Store unused vars from all files and loop through each variable
    const unusedVars = variables.filter(variable => {
        const re = new RegExp(`(${escapeRegex(variable)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    return {
        unused: unusedVars,
        total: variables.length
    };
}

function getPath(strPath) {
    const dir = path.isAbsolute(strPath) ? strPath : path.resolve(strPath);

    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    return glob.sync(path.join(dir, '**/*.scss'));
}

module.exports = {
    find: findUnusedVars
};
