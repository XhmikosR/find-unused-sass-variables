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

    // String of all Sass files' content
    let sassFilesString = sassFiles.reduce((sassStr, file) => {
        sassStr += fs.readFileSync(file, 'utf8');
        return sassStr;
    }, '');

    // Remove jekyll comments
    if (sassFilesString.includes('---')) {
        sassFilesString = sassFilesString.replace(/---/g, '');
    }

    let variables = [];
    const sassVarInfo = [];
    let strSass = '';
    sassFiles.forEach((file, i) => {
        strSass = fs.readFileSync(file, 'utf8');
        if (strSass.includes('---')) {
            strSass = strSass.replace(/---/g, '');
        }

        sassVarInfo[i] = parse(strSass, options.ignore);
        variables = [].concat(...sassVarInfo);
        variables.forEach(sassVar => {
            if (sassVar.filePath === '') {
                sassVar.filePath = file;
            }
        });
    });

    // Store unused vars from all files and loop through each variable
    const unusedVars = variables.filter(variable => {
        const re = new RegExp(`(${escapeRegex(variable.name)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    return {
        unused: unusedVars.map(({ name }) => name),
        unusedInfo: unusedVars,
        unusedTotal: unusedVars.map(({ name }) => name).length,
        total: variables.length
    };
}

module.exports = {
    find: findUnusedVars
};
