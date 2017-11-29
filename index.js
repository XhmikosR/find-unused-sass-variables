'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Blame TC39... https://github.com/benjamingr/RegExp.escape/issues/37
function regExpQuote(str) {
    return str.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function findUnusedVars (dir, isCLI) {
    if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
        throw new Error(`"${dir}": Not a valid directory!`);
    }

    if (isCLI) {
        console.log(`Finding unused variables in "${dir}"...`);
    }

    // store unused vars
    const unUsedVars = [];

    // Array of all Sass files' content
    const sassFiles = glob.sync(path.join(dir, '**/*.scss'));
    // String of all Sass files' content
    let sassFilesString = '';

    sassFiles.forEach((file) => {
        sassFilesString += fs.readFileSync(file, 'utf8');
    });

    // Array of all Sass variables
    const variables = sassFilesString.match(/(^\$[a-zA-Z0-9_-]+[^:])/gm);

    if (isCLI) {
        console.log(`There's a total of ${variables.length} variables.`);
    }

    // Loop through each variable
    variables.forEach((variable) => {
        const re = new RegExp(regExpQuote(variable), 'g');
        const count = sassFilesString.match(re).length;

        if (count === 1) {
            if (isCLI) {
                console.log(`Variable "${variable}" is only used once!`);
            }
            unUsedVars.push(variable);
        }
    });

    return unUsedVars;
}

module.exports = {
    find: findUnusedVars
};
