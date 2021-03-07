'use strict';

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const globP = promisify(glob);

const defaultOptions = {
    ignore: []
};

const findUnusedVars = async(strDir, opts) => {
    const options = parseOptions(opts);
    const dir = await parseDir(strDir);
    // Array of all Sass files
    const sassFiles = await globP(path.join(dir, '**/*.scss'));

    const executions = sassFiles.map(file => parseFile(file, options));
    // String of all Sass files' content
    const sassFilesAsStrings = await Promise.all(executions);

    let variables = [];
    let combinedSassFile = '';

    for (const result of sassFilesAsStrings) {
        variables = [...variables, ...result.variables];
        combinedSassFile += result.sassFileString;
    }

    return filterVariables(combinedSassFile, variables);
};

const parseFile = async(file, options) => {
    let sassFileString = await fs.readFile(file, 'utf8');

    // Remove jekyll comments
    if (sassFileString.includes('---')) {
        sassFileString = sassFileString.replace(/---/g, '');
    }

    const variables = parse(sassFileString, options.ignore);

    return {
        sassFileString,
        variables
    };
};

const filterVariables = (sassFilesString, variables) => {
    // Store unused vars from all files and loop through each variable
    const unusedVars = variables.filter(variable => {
        const re = new RegExp(`(${escapeRegex(variable)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    return {
        unused: unusedVars,
        total: variables.length
    };
};

const parseOptions = opts => {
    const options = { ...defaultOptions, ...opts };

    if (Boolean(options.ignore) && !Array.isArray(options.ignore)) {
        throw new TypeError('`ignore` should be an Array');
    }

    // Trim list of ignored variables
    options.ignore = options.ignore.map(val => val.trim());

    return options;
};

const parseDir = async strDir => {
    const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);
    const stat = await fs.lstat(dir);

    if (!stat.isDirectory()) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    return dir;
};

module.exports = {
    find: findUnusedVars
};
