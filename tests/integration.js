'use strict';

const fusv = require('../index');

const expectedUnused = [
    '$white',
    '$a',
    '$b',
    '$unused'
];

console.log('Run integration tests...');

const result = fusv.find('./');

if (result.total === expectedUnused.length) {
    console.info(`All tests passed (${result.total})`);
    process.exit(0);
} else {
    console.error(`Expect ${expectedUnused.length} and got ${result.total}`);
    process.exit(1);
}
