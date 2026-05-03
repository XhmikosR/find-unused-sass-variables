export function filterVariables(variables, usages) {
  const unused = variables.filter(variable => !usages.has(variable.name));
  const total = variables.length;

  return {
    unused,
    total
  };
}

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
