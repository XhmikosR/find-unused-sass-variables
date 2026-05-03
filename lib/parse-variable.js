import { parse as scssParse } from 'postcss-scss';

const VARIABLE_REF_RE = /\$([\w-]+)/g;

// Adds every variable reference found in text directly to usages
function addVariableRefs(text, usages) {
  if (!text) return;

  for (const [ref] of text.matchAll(VARIABLE_REF_RE)) {
    usages.add(ref);
  }
}

// Extract the content of the outermost parentheses, handling nested parens.
function extractOuterParens(params) {
  const start = params.indexOf('(');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < params.length; i++) {
    if (params[i] === '(') {
      depth++;
    } else if (params[i] === ')' && --depth === 0) {
      return params.slice(start + 1, i);
    }
  }

  return null;
}

// Split an argument list on commas that are not inside nested parentheses.
function splitArgs(arglist) {
  const args = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < arglist.length; i++) {
    if (arglist[i] === '(') {
      depth++;
    } else if (arglist[i] === ')') {
      depth--;
    } else if (arglist[i] === ',' && depth === 0) {
      args.push(arglist.slice(start, i));
      start = i + 1;
    }
  }

  args.push(arglist.slice(start));
  return args;
}

// @mixin foo($arg: $default) and @function bar($x, $y: $z):
// parameter names are local declarations, not usages; default values are usages.
// Handles multi-line params and default values containing nested function calls.
function parseMixinFunctionParams(params) {
  const arglist = extractOuterParens(params);
  if (arglist === null) {
    return {
      localParams: new Set(),
      usages: new Set()
    };
  }

  const localParams = new Set();
  const usages = new Set();

  for (const arg of splitArgs(arglist)) {
    const colonIdx = arg.indexOf(':');
    if (colonIdx === -1) {
      const m = arg.match(/\$([\w-]+)/);
      if (m) localParams.add(`$${m[1]}`);
    } else {
      const lm = arg.slice(0, colonIdx).match(/\$([\w-]+)/);
      if (lm) localParams.add(`$${lm[1]}`);

      addVariableRefs(arg.slice(colonIdx + 1), usages);
    }
  }

  return { localParams, usages };
}

// @each $item in $list / @each $key, $val in $map:
// variables before "in" are loop declarations, those after are usages.
function parseEachParams(params) {
  const inIdx = params.indexOf(' in ');
  if (inIdx === -1) {
    return {
      localParams: new Set(),
      usages: new Set()
    };
  }

  const localParams = new Set();
  const usages = new Set();

  addVariableRefs(params.slice(0, inIdx), localParams);
  addVariableRefs(params.slice(inIdx + 4), usages);

  return { localParams, usages };
}

// @for $i from X through/to Y: $i is the loop declaration, X and Y may be usages.
function parseForParams(params) {
  const localParams = new Set();
  const usages = new Set();
  const m = params.match(/^\s*(\$([\w-]+))\s+from\s+(.*)/);

  if (m) {
    localParams.add(m[1]);
    addVariableRefs(m[3], usages);
  }

  return { localParams, usages };
}

function addAtruleUsages(node, usages) {
  switch (node.name) {
    case 'mixin':
    case 'function': {
      const { usages: defaultUsages } = parseMixinFunctionParams(node.params);
      for (const ref of defaultUsages) usages.add(ref);

      break;
    }

    case 'each': {
      const { usages: eachUsages } = parseEachParams(node.params);
      for (const ref of eachUsages) usages.add(ref);

      break;
    }

    case 'for': {
      const { usages: forUsages } = parseForParams(node.params);
      for (const ref of forUsages) usages.add(ref);

      break;
    }

    default: {
      addVariableRefs(node.params, usages);
    }
  }
}

// Returns [variables, usages, newEnabled]
function collectFromNode(node, fileName, enabled, ignoreList) {
  if (node.type === 'comment') {
    if (node.text === 'fusv-enable') return [[], new Set(), true];
    if (node.text === 'fusv-disable') return [[], new Set(), false];

    return [[], new Set(), enabled];
  }

  const usages = new Set();

  if (node.type === 'decl') {
    const variables = [];

    if (node.prop.startsWith('$') && !ignoreList.includes(node.prop) && enabled) {
      variables.push({
        name: node.prop,
        file: fileName,
        line: node.source.start.line
      });
    } else {
      // Property name may contain interpolation, e.g. --#{$var}: value
      addVariableRefs(node.prop, usages);
    }

    addVariableRefs(node.value, usages);
    return [variables, usages, enabled];
  }

  if (node.type === 'atrule') {
    addAtruleUsages(node, usages);
  } else if (node.type === 'rule') {
    addVariableRefs(node.selector, usages);
  }

  if (node.nodes) {
    let currentEnabled = enabled;
    const variables = [];

    for (const child of node.nodes) {
      const [childVariables, childUsages, newEnabled] = collectFromNode(child, fileName, currentEnabled, ignoreList);
      variables.push(...childVariables);

      for (const ref of childUsages) {
        usages.add(ref);
      }

      currentEnabled = newEnabled;
    }

    return [variables, usages, currentEnabled];
  }

  return [[], usages, enabled];
}

export function parse(fileName, scssString, ignoreList) {
  let enabled = true;
  const variables = [];
  const usages = new Set();

  for (const node of scssParse(scssString).nodes) {
    const [nodeVariables, nodeUsages, newEnabled] = collectFromNode(node, fileName, enabled, ignoreList);
    variables.push(...nodeVariables);

    for (const ref of nodeUsages) {
      usages.add(ref);
    }

    enabled = newEnabled;
  }

  return {
    variables,
    usages
  };
}
