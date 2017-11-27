'use strict';

const findUnusedVars = require('./src/findUnusedVars');

module.export = {
    find(folder) {
        return findUnusedVars(folder, false);
    }
};
