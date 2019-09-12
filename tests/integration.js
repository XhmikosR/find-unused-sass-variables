'use strict';

const fusv = require('..');

const expectedUnused = [
    '$a',
    '$b',
    '$unused',
    '$black',
    '$nestedVar',
    '$nestNestedVar'
];

const ignore = ['$ignored-variable'];

console.log('Running integration tests...');

const result = fusv.find('./', { ignore });

if (result.unused.length === expectedUnused.length) {
    console.info('Tests passed!');
} else {
    console.error(`Expected ${expectedUnused.length} and got ${result.unused.length}`);
    console.warn(`Expected ${expectedUnused.join(', ')}`);
    console.warn(`Got ${result.unused.join(', ')}`);
    process.exit(1);
}
