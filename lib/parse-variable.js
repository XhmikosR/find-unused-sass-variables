'use strict';

const { parse: scssParse } = require('postcss-scss');
const Declaration = require('postcss/lib/declaration');
const Comment = require('postcss/lib/comment');
let fusvEnabled = true;

const parseNodes = (nodes, variables, ignoreList) => {
    for (const node of nodes) {
        findVars(node, variables, ignoreList);
    }
};

const findVars = (node, result, ignoreList) => {
    if (node instanceof Comment) {
        parseComment(node);

        return;
    }

    if (node instanceof Declaration && node.prop.startsWith('$') && !ignoreList.includes(node.prop) && fusvEnabled) {
        result.push(node.prop);

        return;
    }

    if (node.nodes) {
        parseNodes(node.nodes, result, ignoreList);
    }
};

const parseComment = node => {
    if (node.raws.text === 'fusv-enable') {
        fusvEnabled = true;
    } else if (node.raws.text === 'fusv-disable') {
        fusvEnabled = false;
    }
};

const parse = (scssString, ignoreList) => {
    const parsedScss = scssParse(scssString);
    const variables = [];

    parseNodes(parsedScss.nodes, variables, ignoreList);
    return variables;
};

module.exports = parse;
