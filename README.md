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
console.log(unused.unusedOrigin);
// [
//  {
//      name: '$foo',
//      column: x_1,
//      line: y_2,
//      file 'scss/dir1/dir2/foo.scss'
//  },
//  {
//      name: '$bar',
//      column: x_2,
//      line: y_2
//      file 'scss/bar.scss'
//  }
//]
console.log(unused.total);
// Total number of variables in the files in directory 'scss'
console.log(unused.totalUnused);
// Number of unused variables in the files in directory 'scss'

// ignoring variables
const ignoredVars = ['$my-var', '$my-second-var']
unused = fusv.find('scss', { ignore: ignoredVars })
```

### find(dir, options)

* `dir`: string
* `options`: optional options Object

Returns an object with `unusedOrigin`, `unused`, `totalUnused` and`total`.

* `unusedOrigin` is an array carrying objects containing unused sass variables and their origin,
Information included are the `name` of the variable as well as the `line` and `column` of the variable in their originating `file`,
* `unused` is an of array of unused variables without further information,
* `totalUnused` has the sum of all unused variables of all examined files in given `dir`,
*  and `total` has the sum of all variables of all examined files in given `dir` (unused and used ones).

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
