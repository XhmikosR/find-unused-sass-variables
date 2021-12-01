# find-unused-sass-variables

[![npm version](https://img.shields.io/npm/v/find-unused-sass-variables)](https://www.npmjs.com/package/find-unused-sass-variables)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/XhmikosR/find-unused-sass-variables?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/XhmikosR/find-unused-sass-variables/alerts/)
[![Build Status](https://img.shields.io/github/workflow/status/XhmikosR/find-unused-sass-variables/CI/main?label=CI&logo=github)](https://github.com/XhmikosR/find-unused-sass-variables/actions?query=workflow%3ACI+branch%3Amain)

A simple tool to check for unused Sass variables in a directory.

## Install

```shell
npm install find-unused-sass-variables --save-dev
```

## Usage

```shell
find-unused-sass-variables folder [, folder2...] --ignore "$my-var,$my-second-var" -e scss -e css
# or
fusv folder [, folder2...]
```

## API

```js
const fusv = require('find-unused-sass-variables')
// 'directory' is a folder
let unused = fusv.find('directory')
// Array of unused variables
console.log(unused.unused);
// Array<{ name: string, line: string, file: string }>
/*
* [
*   {
*      name = '$foo';
*      file = 'file where this variable can be found';
*      line = 'line of file';
*   },
*   {
*      ....
*   }
* ]
*/
console.log(unused.total);
// Total number of variables in the files

// ignoring variables
const ignoredVars = ['$my-var', '$my-second-var']
unused = fusv.find('directory', { ignore: ignoredVars })

// specifing file extensions
unused = fusv.find('directory', { fileExtensions: ['css','scss']})

// asynchronous usage
let unused = await fusv.findAsync('directory')

// or like a Promise
let unused = fusv.findAsync('directory').then(result => {
    console.log(unused.unused);
})

```

### find(dir, options)

* `dir`: string
* `options`: optional options Object

Returns an object with `unused` and `total`. `unused` has the array of unused variables and `total` has the sum of all variables in the files (unused and used ones).

### findAsync(dir, options)

* as `find(dir, options)`

Returns a Promise which resolves result; is the same as `find(dir, options)` result.


#### options.ignore

Array of strings of the variables to ignore, e.g. `['$my-var', '$my-second-var']`

#### options.fileExtensions

Array of file extensions to search for unused variables in. e.g. `['scss']`

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

