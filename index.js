'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const escapeRegex = require('escape-string-regexp');
const parse = require('./lib/parse-variable');

const defaultOptions = {
    ignore: []
};

function getLineCountOfSassFile(sassFileString) {
    let lineCount = 0;
    const parsedScss = sassFileString;
    for (let i = 0, n = parsedScss.length; i < n; ++i) {
        if (parsedScss[i] === '\n') {
            ++lineCount;
        }
    }

    return lineCount;
}

function getFileStringConcatenationAndLineInfo(sassFiles) {
    const varLineInfoInAllFiles = [];
    const currentDirectory = process.cwd();
    let lineCountCumulated = 0;
    const sassFilesString = sassFiles.reduce((sassStrCat, file) => {
        const sassStr = fs.readFileSync(file, 'utf8');
        const sassStrLineCount = getLineCountOfSassFile(sassStr);
        sassStrCat += sassStr;
        lineCountCumulated += sassStrLineCount;
        const fileRelativePath = path.relative(currentDirectory, file);
        varLineInfoInAllFiles.push({
            file: fileRelativePath,
            lineCountCumulated
        });
        return sassStrCat;
    }, '');

    return {
        varLineInfoInAllFiles,
        sassFilesString
    };
}

function removeJekyllComments(sassFileString) {
    // Remove jekyll comments
    if (sassFileString.includes('---')) {
        sassFileString = sassFileString.replace(/---/g, '');
    }

    return sassFileString;
}

function filterVariableInfoWithSingleOccurence(variables, sassFilesString) {
    const unusedVarsInfo = variables.filter(variableInfo => {
        const variableName = variableInfo.name;
        const re = new RegExp(`(${escapeRegex(variableName)})\\b(?!-)`, 'g');

        return sassFilesString.match(re).length === 1;
    });

    return unusedVarsInfo;
}

function getVariableLinePerContainingFile(unusedVarsInfo, varLineInfoInAllFiles) {
    for (
        let i = 0, j = 0, linesChecked = 0,
            { lineCountCumulated } = varLineInfoInAllFiles[j],
            lineInOwnFile = 0;
        i < unusedVarsInfo.length && j < varLineInfoInAllFiles.length;
        ++i
    ) {
        const varLineInAllFiles = unusedVarsInfo[i].lineInAllFiles;
        if (varLineInAllFiles > lineCountCumulated) {
            linesChecked = lineCountCumulated;
            lineCountCumulated = varLineInfoInAllFiles[++j].lineCountCumulated;
        }

        lineInOwnFile = varLineInAllFiles - linesChecked;
        unusedVarsInfo[i].lineInOwnFile = lineInOwnFile;
        unusedVarsInfo[i].file = varLineInfoInAllFiles[j].file;
        delete unusedVarsInfo[i].lineInAllFiles;
    }

    return unusedVarsInfo;
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

    let {
        varLineInfoInAllFiles,
        sassFilesString
    } = getFileStringConcatenationAndLineInfo(sassFiles);

    sassFilesString = removeJekyllComments(sassFilesString);

    const variablesInfo = parse(sassFilesString, options.ignore);

    let unusedVarsInfo = filterVariableInfoWithSingleOccurence(variablesInfo, sassFilesString);

    unusedVarsInfo = getVariableLinePerContainingFile(unusedVarsInfo, varLineInfoInAllFiles);

    return {
        unused: unusedVarsInfo,
        total: unusedVarsInfo.length
    };
}

module.exports = {
    find: findUnusedVars
};
