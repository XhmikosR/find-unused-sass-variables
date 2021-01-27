'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const defaultOptions = {
    ignore: []
};

function findUnusedVars(strDir, opts) {
    const options = Object.assign(defaultOptions, opts);
    const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);

    if (Boolean(options.ignore) && !Array.isArray(options.ignore)) {
        throw new TypeError('`ignore` should be an Array');
    }

    // Trim list of ignored variables
    options.ignore = options.ignore.map(val => val.trim());

    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    // Array of all Sass files
    const sassFiles = glob.sync(path.join(dir, '**/*.scss'));

    // Build sassFilesString as concatenation of all sassFiles
    // Get all variables and their origin information
    let variables = [];
    const sassVarInfo = [];
    let strSass = '';
    let sassFilesString = '';
    sassFiles.forEach((file, i) => {
        strSass = fs.readFileSync(file, 'utf8');

        // remove jekyl comments
        if (strSass.includes('---')) {
            strSass = strSass.replace(/---/g, '');
        }

        sassVarInfo[i] = parse(strSass, options.ignore, file);

        // eslint-disable-next-line unicorn/prefer-spread
        variables = [].concat(...sassVarInfo);
        sassFilesString += strSass;
    });

    // Get unused variables by filtering single occuring variables in in sassFilesString
    const unusedVars = variables.filter(variable => {
        const re = new RegExp(`(${escapeRegex(variable.name)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    // Unused and total for backwards compatibility
    return {
        totalUnusedVars: unusedVars.map(({ name }) => name).length,
        total: variables.length,
        unusedInfo: unusedVars,
        unused: unusedVars.map(({ name }) => name)
    };
}

module.exports = {
    find: findUnusedVars
};
