'use strict';

const { parse: scssParse } = require('postcss-scss');
const Declaration = require('postcss/lib/declaration');

function parseNodes(nodes, variables, ignoreList) {
    for (let i = 0, len = nodes.length; i < len; i++) {
        findVars(nodes[i], variables, ignoreList);
    }
}

function findVars(node, result, ignoreList) {
    if (node instanceof Declaration && node.prop.charAt(0) === '$' && !ignoreList.includes(node.prop)) {
        result.push(node.prop);

        return;
    }

    if (node.nodes) {
        parseNodes(node.nodes, result, ignoreList);
    }
}

function parse(scssString, ignoreList) {
    const parsedScss = scssParse(scssString);
    const variables = [];

    parseNodes(parsedScss.nodes, variables, ignoreList);
    return variables;
}

module.exports = parse;
