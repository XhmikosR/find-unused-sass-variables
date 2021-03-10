#!/usr/bin/env node

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

(async() => {
    try {
        console.log('Running integration tests...');

        const result = await fusv.find('./tests/', { ignore });

        if (result.unused.length === expectedUnused.length) {
            console.log('Tests passed!');
        } else {
            throw new Error(
                `Expected ${expectedUnused.length} unused variables and got ${result.unused.length}.\n` +
                `Expected: ${expectedUnused.join(', ')}\n` +
                `Got: ${result.unused.join(', ')}`
            );
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
