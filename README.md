# find-unused-sass-variables

[![NPM version](https://img.shields.io/npm/v/find-unused-sass-variables.svg)](https://www.npmjs.com/package/find-unused-sass-variables)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/XhmikosR/find-unused-sass-variables.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/XhmikosR/find-unused-sass-variables/alerts/)
[![Build Status](https://github.com/XhmikosR/find-unused-sass-variables/workflows/Tests/badge.svg)](https://github.com/XhmikosR/find-unused-sass-variables/actions?workflow=Tests)
[![Dependency Status](https://img.shields.io/david/XhmikosR/find-unused-sass-variables.svg)](https://david-dm.org/XhmikosR/find-unused-sass-variables)
[![devDependency Status](https://img.shields.io/david/dev/XhmikosR/find-unused-sass-variables.svg)](https://david-dm.org/XhmikosR/find-unused-sass-variables#info=devDependencies)

A simple tool to check for unused Sass variables in a directory.

## Install

```shell
npm install find-unused-sass-variables --save-dev
```

## Usage

```shell
find-unused-sass-variables folder [, folder2...] --ignore "$my-var,$my-second-var"
# or
fusv folder [, folder2...]
```

## API

```js
const fusv = require('find-unused-sass-variables')
// 'scss' is a folder
let unused = fusv.find('scss')
// Array of unused variables
console.log(unused.unused);
// ['$foo', '$bar', '$imunused']
console.log(unused.total);
// Total number of variables in the files

// ignoring variables
const ignoredVars = ['$my-var', '$my-second-var']
unused = fusv.find('scss', { ignore: ignoredVars })
```

### find(dir, options)

* `dir`: string
* `options`: optional options Object

Returns an object with `unused` and `total`. `unused` has the array of unused variables and `total` has the sum of all variables in the files (unused and used ones).

#### options.ignore

Array of strings of the variables to ignore, e.g. `['$my-var', '$my-second-var']`

## Disable & enable

Disable or enable `fusv` with the `fusv-disable` and `fusv-enable` comments:

```scss
$used-variable-1: #666;

// fusv-disable
$unused-variable: #coffee;
// fusv-enable

$used-variable-2: #ace;
```

## Notes

* The tool's logic is pretty "dumb"; if you use the same name for a variable in different files or namespaces,
  then it won't distinguish between them.
* The tool only looks for `.scss` files currently.

## License

[MIT](LICENSE)
