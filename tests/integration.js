'use strict';

const fusv = require('..');

const expectedUnused = [
    '$a',
    '$b',
    '$unused',
    '$black'
];

const ignore = ['$ignored-variable'];

console.log('Running integration tests...');

const result = fusv.find('./', { ignore });

if (result.unused.length === expectedUnused.length) {
    console.info('Tests passed!');
    process.exit(0);
} else {
    console.error(`Expected ${expectedUnused.length} and got ${result.unused.length}`);
    console.warn(`Expected ${result.unused.join(', ')} to equal ${expectedUnused.join(', ')}`);
    process.exit(1);
}
