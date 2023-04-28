#!/usr/bin/env node

import process from 'node:process';
import fusv from '../index.js';

const allExpectedUnused = [
  '$a',
  '$b',
  '$unused',
  '$black',
  '$nestedVar',
  '$nestNestedVar',
  '$enabled-variable',
  '$ignored-variable'
];
const expectedUnused = [
  '$unused',
  '$black',
  '$nestedVar',
  '$nestNestedVar',
  '$enabled-variable'
];
const ignore = ['$ignored-variable', '$a', '$b'];

console.log('Running "Options" tests...');

const runTests = async(description, dir, options, expectedUnused) => {
  const result = await fusv.findAsync(dir, options);
  try {
    console.log(`Running, ${description}...`);
    if (result.unused.length === expectedUnused.length) {
      console.log('Test passed!');
    } else {
      throw new Error(
        `Expected ${expectedUnused.length} unused variables and got ${result.unused.length}.\n` +
        `Expected: ${expectedUnused.join(', ')}\n` +
        `Got: ${JSON.stringify(result, null, 2)}`
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runTests('"ignore" option test', './tests/', { ignore }, expectedUnused);

runTests('"fileExtension" option test with fullstop prefix', './tests/', { fileExtensions: '.scss' }, allExpectedUnused);

runTests('"fileExtensions" option test', './tests/', { fileExtensions: ['css'] }, []);

runTests('"fileExtensions" option test', './tests/', { fileExtensions: ['css', 'scss'] }, allExpectedUnused);
