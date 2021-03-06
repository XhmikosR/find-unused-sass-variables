'use strict';

const fusv = require('..');

const expectedUnused = [
    '$a',
    '$b',
    '$unused',
    '$black',
    '$nestedVar',
    '$nestNestedVar',
    '$enabled-variable',
    '$other-folder-variable'
];

const ignore = ['$ignored-variable'];

console.log('Running integration tests...');

const result = fusv.find('./tests/main', { ignore });

if (result.unused.length === expectedUnused.length) {
    console.info('Tests passed!');
} else {
    throw new Error(`Expected ${expectedUnused.length} and got ${result.unused.length}
Expected: ${expectedUnused.join(', ')}
Got: ${result.unused.join(', ')}`);
}

// Result for Combine

const expectedUnusedForCombine = [
    '$a',
    '$b',
    '$unused',
    '$black',
    '$nestedVar',
    '$nestNestedVar',
    '$enabled-variable'
];

// For combine with other folder './tests/other' also can with node_modules ect..
const resultOfCombine = fusv.find(['./tests/main', './tests/other'], { ignore, combine: true });

if (resultOfCombine.unused.length === expectedUnusedForCombine.length) {
    console.info('Combine Folders Tests passed!');
} else {
    throw new Error(`Expected ${expectedUnusedForCombine.length} and got ${result.unused.length}
Expected: ${expectedUnusedForCombine.join(', ')}
Got: ${result.unused.join(', ')} For Combine Folder Tests`);
}
