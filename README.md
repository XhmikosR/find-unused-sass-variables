# find-unused-sass-variables

[![npm version](https://img.shields.io/npm/v/find-unused-sass-variables?logo=npm&logoColor=fff)](https://www.npmjs.com/package/find-unused-sass-variables)
[![Build Status](https://img.shields.io/github/actions/workflow/status/XhmikosR/find-unused-sass-variables/test.yml?branch=main&label=CI&logo=github)](https://github.com/XhmikosR/find-unused-sass-variables/actions/workflows/test.yml?query=branch%3Amain)

A simple tool to check for unused Sass variables in a directory.

## Install

```shell
npm install find-unused-sass-variables --save-dev
```

## Usage

```shell
find-unused-sass-variables folder [, folder2...] --ignore "$my-var,$my-second-var" -e scss -e css --ignoreFiles file-with-unused-vars.scss
# or
fusv folder [, folder2...] --ignore "$my-var,$my-second-var" -e scss -e css --ignoreFiles file-with-unused-vars.scss
```

## API

```js
import { findAsync, find } from 'find-unused-sass-variables';

// 'directory' is a folder
const unused = find('directory');
// Array of unused variables
console.log(unused.unused);
// Array<{ name: string, line: string, file: string }>
/*
[
  {
    name = '$foo';
    file = 'file where this variable can be found';
    line = 'line of file';
  },
  {
    ....
  }
]
*/
// Total number of variables in the files
console.log(unused.total);
```

```js
// Ignoring variables
const ignoredVars = ['$my-var', '$my-second-var'];
const unused = find('directory', { ignore: ignoredVars });
```

```js
// Ignoring files
const ignoreFiles = ['./file-with-unused-vars.scss', '**/_variables.scss'];
const unused = fusv.find('directory', { ignoreFiles });
```

```js
// Specifying file extensions
const unused = find('directory', { fileExtensions: ['css','scss']});
```

```js
// Asynchronous usage
let unused = await findAsync('directory');

// or like a Promise
unused = findAsync('directory').then(result => {
  console.log(unused.unused);
});
```

### find(dir, options)

* `dir`: string
* `options`: optional options Object

Returns an object with `unused` and `total`. `unused` has the array of unused variables and `total` has the sum of all variables in the files (unused and used ones).

### findAsync(dir, options)

Returns a Promise which resolves result; returns the same as `find(dir, options)`.

#### options.ignore

Array of strings of the variables to ignore, e.g. `['$my-var', '$my-second-var']`

#### options.ignoreFiles

Array of strings of files to ignore, e.g. `['./file-with-unused-vars.scss', '**/_variables.scss']`.

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
* The tool only looks for `.scss` files by default, but you can optionally specify the file extension.

## License

[MIT](LICENSE)
