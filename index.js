'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const defaultOptions = {
    ignore: []
};

function calcLineOfVar(varInfo, singleFilesInfo) {
    // setup "static" function variables
    if (typeof calcLineOfVar.counter === 'undefined') {
        calcLineOfVar.counter = 0;
    }

    if (typeof calcLineOfVar.linesChecked === 'undefined') {
        calcLineOfVar.linesChecked = 0;
    }

    if (typeof calcLineOfVar.linesCumulated === 'undefined') {
        const currentFileInfo = singleFilesInfo[0];
        calcLineOfVar.linesCumulated = currentFileInfo.linesCumulated;
    }

    // Since finding unused variables work on a "catFile",
    // i.e., a concatenation of all files, we have to calculate lines per file
    // from variable lines in the catFile
    // as long as the variables line in catFile exceeds the sum of line from
    // previous file, use the tracking info of the next file
    while (varInfo.lineInAllFiles > calcLineOfVar.linesCumulated) {
        const currentFileInfo = singleFilesInfo[++calcLineOfVar.counter];
        calcLineOfVar.linesChecked = calcLineOfVar.linesCumulated;
        calcLineOfVar.linesCumulated = currentFileInfo.linesCumulated;
    }

    // line in own file of a variable is equal to its line in the catFile minus
    // the checked lines, i.e., the sum of all lines from previous files
    varInfo.lineInOwnFile = varInfo.lineInAllFiles - calcLineOfVar.linesChecked;
    varInfo.file = singleFilesInfo[calcLineOfVar.counter].file;
    delete varInfo.lineInAllFiles;

    return varInfo;
}

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

    const variables = parse(sassFilesString, options.ignore);

    // Filter the unused variables from variables by checking
    // the number of occurences in sassFilesString
    const unusedVars = variables.filter(variable => {
        const re = new RegExp(`(${escapeRegex(variable.name)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    // Get per file:
    //      path relatively to given sass file directory
    //      linesCumulated: sum of all files before and including
    //      the currently examined file
    const singleFilesInfo = [];
    const currentDirectory = process.cwd();

    let linesCumulated = 0;

    sassFiles.forEach(file => {
        const sassStr = fs.readFileSync(file, 'utf8');
        const fileRelativePath = path.relative(currentDirectory, file);

        let totalLines = 0;
        for (let i = 0, n = sassStr.length; i < n; ++i) {
            if (sassStr[i] === '\n') {
                ++totalLines;
            }
        }

        linesCumulated += totalLines;

        singleFilesInfo.push({
            file: fileRelativePath,
            linesCumulated
        });
    }, '');

    // calculate line information per variable
    for (let varInfo of unusedVars) {
        varInfo = calcLineOfVar(varInfo, singleFilesInfo);
    }

    return {
        unused: unusedVars,
        totalUnusedVars: unusedVars.length
    };
}

module.exports = {
    find: findUnusedVars
};
