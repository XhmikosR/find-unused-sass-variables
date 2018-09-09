'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Blame TC39... https://github.com/benjamingr/RegExp.escape/issues/37
function regExpQuote(str) {
    return str.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function findUnusedVars(strDir) {
    const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);

    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    // Array of all Sass files
    const sassFiles = glob.sync(path.join(dir, '**/*.scss'));

    // String of all Sass files' content
    const sassFilesString = sassFiles.reduce((sassStr, file) => {
        sassStr += fs.readFileSync(file, 'utf8');
        return sassStr;
    }, '');

    // Array of all Sass variables
    const variables = sassFilesString.match(/^\$[\w-]+(^\s:)?/gm) || [];

    // Store unused vars from all files and loop through each variable
    const unusedVars = variables.filter((variable) => {
        const re = new RegExp(regExpQuote(variable), 'g');

        return sassFilesString.match(re).length === 1;
    });

    return {
        unused: unusedVars,
        total: variables.length
    };
}

module.exports = {
    find: findUnusedVars
};
