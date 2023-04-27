#!/usr/bin/env node

import process from 'node:process';
import { find, findAsync } from '../index.js';

const expectedUnused = [
  '$a',
  '$b',
  '$unused',
  '$black',
  '$nestedVar',
  '$nestNestedVar',
  '$enabled-variable'
];

const ignore = ['$ignored-variable'];
const ignoreFiles = ['**/ignored-file*.scss'];

const runTests = (type, result) => {
  console.log(`Running ${type} integration tests...`);

  if (result.unused.length === expectedUnused.length) {
    console.log('Tests passed!');
  } else {
    throw new Error(
      `Expected ${expectedUnused.length} unused variables and got ${result.unused.length}.\n` +
      `Expected: ${expectedUnused.join(', ')}\n` +
      `Got: ${JSON.stringify(result, null, 2)}`
    );
  }
};

try {
  const result = find('./tests/', { ignore, ignoreFiles });
  runTests('sync', result);
} catch (error) {
  console.error(error);
  process.exit(1);
}

(async() => {
  try {
    const result = await findAsync('./tests/', { ignore, ignoreFiles });
    runTests('async', result);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
