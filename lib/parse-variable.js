import { parse as scssParse } from 'postcss-scss';
/* eslint-disable node/file-extension-in-import */
import Declaration from 'postcss/lib/declaration';
import Comment from 'postcss/lib/comment';
/* eslint-enable node/file-extension-in-import */

let file = '';
let fusvEnabled = true;

const UnusedInfo = function(node) {
    this.name = node.prop;
    this.line = node.source.start.line;
    this.file = file;
};

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
        result.push(new UnusedInfo(node));

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

const parse = (fileName, scssString, ignoreList) => {
    file = fileName;
    const parsedScss = scssParse(scssString);
    const variables = [];

    parseNodes(parsedScss.nodes, variables, ignoreList);
    return variables;
};

export default parse;
