'use strict';

const { parse: scssParse } = require('postcss-scss');
const Declaration = require('postcss/lib/declaration');
const Comment = require('postcss/lib/comment');
let fusvEnabled = true;
let variables = [];

const parseNodes = (nodes, ignoreList) => {
    nodes.forEach(node => findVars(node, ignoreList));
};

const findVars = (node, ignoreList) => {
    if (node instanceof Comment) {
        parseComment(node);

        return;
    }

    if (node instanceof Declaration && node.prop.startsWith('$') && !ignoreList.includes(node.prop) && fusvEnabled) {
        variables.push(node.prop);

        return;
    }

    if (node.nodes) {
        parseNodes(node.nodes, ignoreList);
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
    variables = [];
    parseNodes(parsedScss.nodes, ignoreList);
    return variables;
};

module.exports = parse;
