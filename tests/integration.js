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

const execBaseTest = (type, result) => {
    console.log(`Running ${type} integration tests...`);

    if (result.unused.length === expectedUnused.length) {
        console.log('Tests passed!');
    } else {
        throw new Error(
            `Expected ${expectedUnused.length} unused variables and got ${result.unused.length}.\n` +
            `Expected: ${expectedUnused.join(', ')}\n` +
            `Got: ${result.unused.join(', ')}`
        );
    }
};

try {
    const result = fusv.find('./tests/', { ignore });
    execBaseTest('Sync', result);
} catch (error) {
    console.error(error);
    process.exit(1);
}

(async() => {
    try {
        const result = await fusv.findAsync('./tests/', { ignore });
        execBaseTest('Async', result);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
