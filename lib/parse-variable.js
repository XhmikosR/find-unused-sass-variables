import { parse as scssParse } from 'postcss-scss';
/* eslint-disable n/file-extension-in-import */
import Declaration from 'postcss/lib/declaration';
import Comment from 'postcss/lib/comment';
/* eslint-enable n/file-extension-in-import */

let file = '';
let fusvEnabled = true;

const UnusedInfo = function(node) {
  this.name = node.prop;
  this.line = node.source.start.line;
  this.file = file;
};

const parseNodes = ({ nodes, variables, ignore }) => {
  for (const node of nodes) {
    findVars({ node, variables, ignore });
  }
};

const findVars = ({ node, variables, ignore }) => {
  if (node instanceof Comment) {
    parseComment(node);
    return;
  }

  if (node instanceof Declaration && node.prop.startsWith('$') && !ignore.includes(node.prop) && fusvEnabled) {
    variables.push(new UnusedInfo(node));
    return;
  }

  if (node.nodes) {
    parseNodes({ nodes: node.nodes, variables, ignore });
  }
};

const parseComment = node => {
  if (node.raws.text === 'fusv-enable') {
    fusvEnabled = true;
  } else if (node.raws.text === 'fusv-disable') {
    fusvEnabled = false;
  }
};

const parse = ({ fileName, content, ignore }) => {
  file = fileName;
  const { nodes } = scssParse(content);
  const variables = [];

  parseNodes({ nodes, variables, ignore });
  return variables;
};

export { parse };
