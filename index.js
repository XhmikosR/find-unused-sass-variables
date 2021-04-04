'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const globP = promisify(glob);

const defaultOptions = {
    ignore: []
};

const findUnusedVarsAsync = async(strDir, opts) => {
    const options = parseOptions(opts);
    const dir = await sanitizeDirAsync(strDir);
    // Array of all Sass files
    const sassFiles = await globP(path.join(dir, '**/*.scss'));

    const executions = sassFiles.map(file => parseFileAsync(file, options));
    // String of all Sass files' content
    const sassFilesAsStrings = await Promise.all(executions);
    return makeResults(sassFilesAsStrings);
};

const findUnusedVarsSync = (strDir, opts) => {
    const options = parseOptions(opts);
    const dir = sanitizeDirSync(strDir);
    // Array of all Sass files
    const sassFiles = glob.sync(path.join(dir, '**/*.scss'));

    const sassFilesAsStrings = sassFiles.map(file => parseFileSync(file, options));

    return makeResults(sassFilesAsStrings);
};

function makeResults(sassFilesAsStrings) {
    let variables = [];
    let combinedSassFile = '';

    for (const result of sassFilesAsStrings) {
        variables = [...variables, ...result.variables];
        combinedSassFile += result.sassFileString;
    }

    return filterVariables(combinedSassFile, variables);
}

const parseFileAsync = async(file, options) => {
    const sassFileString = await fs.promises.readFile(file, 'utf8');
    return parseData(sassFileString, options);
};

const parseFileSync = (file, options) => {
    const sassFileString = fs.readFileSync(file, 'utf8');
    return parseData(sassFileString, options);
};

const parseData = (sassFileString, options) => {
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

const sanitizeDirAsync = async strDir => {
    const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);
    const stat = await fs.promises.lstat(dir);
    return checkDir(stat, dir);
};

const sanitizeDirSync = strDir => {
    const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);
    const stat = fs.statSync(dir);

    return checkDir(stat, dir);
};

function checkDir(stat, dir) {
    if (!stat.isDirectory()) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    return dir;
}

module.exports = {
    findAsync: findUnusedVarsAsync,
    find: findUnusedVarsSync
};
