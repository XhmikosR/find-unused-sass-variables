'use strict';

const fusv = require('..');

const expectedUnused = [
    '$white',
    '$a',
    '$b',
    '$unused'
];

const ignore = ['$ignored-variable'];

console.log('Running integration tests...');

const result = fusv.find('./', { ignore });

if (result.length === expectedUnused.length) {
    console.info(`All tests passed (${result.length})`);
    process.exit(0);
} else {
    console.error(`Expect ${expectedUnused.length} and got ${result.length}`);
    process.exit(1);
}
