'use strict';

const fusv = require('..');

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

console.log('Running integration tests...');

const results = fusv.find('./tests/', { ignore });
results.then(result => {
    checkResults(result);
});

function checkResults(result) {
    if (result.unused.length === expectedUnused.length) {
        console.info('Tests passed!');
    } else {
        throw new Error(`Expected ${expectedUnused.length} and got ${result.unused.length}
        Expected: ${expectedUnused.join(', ')}
        Got: ${result.unused.join(', ')}`);
    }
}
