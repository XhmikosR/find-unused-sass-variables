import { parse as scssParse } from 'postcss-scss';

let file = '';
let fusvEnabled = true;

class UnusedInfo {
  constructor(node) {
    this.name = node.prop;
    this.line = node.source.start.line;
    this.file = file;
  }
}

const parseNodes = (nodes, variables, ignoreList) => {
  for (const node of nodes) {
    findVars(node, variables, ignoreList);
  }
};

const findVars = (node, result, ignoreList) => {
  if (node.type === 'comment') {
    parseComment(node);
    return;
  }

  if (node.type === 'decl' && node.prop.startsWith('$') && !ignoreList.includes(node.prop) && fusvEnabled) {
    result.push(new UnusedInfo(node));
    return;
  }

  if (node.nodes) {
    parseNodes(node.nodes, result, ignoreList);
  }
};

const parseComment = node => {
  if (node.text === 'fusv-enable') {
    fusvEnabled = true;
  } else if (node.text === 'fusv-disable') {
    fusvEnabled = false;
  }
};

const parse = (fileName, scssString, ignoreList) => {
  file = fileName;
  fusvEnabled = true;
  const parsedScss = scssParse(scssString);
  const variables = [];

  parseNodes(parsedScss.nodes, variables, ignoreList);
  return variables;
};

export { parse };
