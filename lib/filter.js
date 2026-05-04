/** @import { Variable } from './parse-variable.js' */

/**
 * @param {Variable[]} variables
 * @param {Set<string>} usages
 * @returns {{ unused: Variable[], total: number }}
 */
export function filterVariables(variables, usages) {
  const unused = variables.filter(variable => !usages.has(variable.name));
  const total = variables.length;

  return {
    unused,
    total
  };
}

/**
 * @param {{ variables: Variable[], usages: Set<string> }[]} parsedFiles
 * @returns {{ unused: Variable[], total: number }}
 */
export function aggregateResults(parsedFiles) {
  const variables = [];
  const usages = new Set();

  for (const result of parsedFiles) {
    variables.push(...result.variables);

    for (const reference of result.usages) {
      usages.add(reference);
    }
  }

  return filterVariables(variables, usages);
}
