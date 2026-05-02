import { parse as scssParse } from 'postcss-scss';

// Returns [variables, newEnabled]
function collectFromNode(node, fileName, enabled, ignoreList) {
  if (node.type === 'comment') {
    if (node.text === 'fusv-enable') return [[], true];
    if (node.text === 'fusv-disable') return [[], false];

    return [[], enabled];
  }

  if (
    node.type === 'decl' &&
    node.prop.startsWith('$') &&
    !ignoreList.includes(node.prop) &&
    enabled
  ) {
    return [
      [{ name: node.prop, line: node.source.start.line, file: fileName }],
      enabled
    ];
  }

  if (node.nodes) {
    let currentEnabled = enabled;
    const vars = [];

    for (const child of node.nodes) {
      const [childVars, newEnabled] = collectFromNode(child, fileName, currentEnabled, ignoreList);
      vars.push(...childVars);
      currentEnabled = newEnabled;
    }

    return [vars, currentEnabled];
  }

  return [[], enabled];
}

export function parse(fileName, scssString, ignoreList) {
  let enabled = true;
  const allVars = [];

  for (const node of scssParse(scssString).nodes) {
    const [vars, newEnabled] = collectFromNode(node, fileName, enabled, ignoreList);
    allVars.push(...vars);
    enabled = newEnabled;
  }

  return allVars;
}
