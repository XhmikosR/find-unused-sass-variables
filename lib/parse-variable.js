'use strict';

const { parse: scssParse } = require('postcss-scss');
const Declaration = require('postcss/lib/declaration');
const Comment = require('postcss/lib/comment');
let fusvEnabled = true;

function parseNodes(nodes, variables, ignoreList, file = '') {
    for (const node of nodes) {
        findVars(node, variables, ignoreList, file);
    }
}

function findVars(node, result, ignoreList, file = '') {
    if (node instanceof Comment) {
        parseComment(node);

        return;
    }

    if (node instanceof Declaration && node.prop.startsWith('$') && !ignoreList.includes(node.prop) && fusvEnabled) {
        result.push({
            name: node.prop,
            line: node.source.start.line,
            column: node.source.start.column,
            file
        });

        return;
    }

    if (node.nodes) {
        parseNodes(node.nodes, result, ignoreList, file);
    }
}

function parseComment(node) {
    if (node.raws.text === 'fusv-enable') {
        fusvEnabled = true;
    } else if (node.raws.text === 'fusv-disable') {
        fusvEnabled = false;
    }
}

function parse(scssString, ignoreList, file = '') {
    const parsedScss = scssParse(scssString);
    const variables = [];

    parseNodes(parsedScss.nodes, variables, ignoreList, file);
    return variables;
}

module.exports = parse;
