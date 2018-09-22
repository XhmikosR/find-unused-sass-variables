# find-unused-sass-variables

[![NPM version](https://img.shields.io/npm/v/find-unused-sass-variables.svg)](https://www.npmjs.com/package/find-unused-sass-variables)
[![Build Status](https://img.shields.io/travis/XhmikosR/find-unused-sass-variables/master.svg)](https://travis-ci.org/XhmikosR/find-unused-sass-variables)
[![Dependency Status](https://img.shields.io/david/XhmikosR/find-unused-sass-variables.svg)](https://david-dm.org/XhmikosR/find-unused-sass-variables)
[![devDependency Status](https://img.shields.io/david/dev/XhmikosR/find-unused-sass-variables.svg)](https://david-dm.org/XhmikosR/find-unused-sass-variables#info=devDependencies)

A simple tool to check for unused Sass variables in a directory.

## Usage

```shell
find-unused-sass-variables folder [, folder2...]
# or
fusv folder [, folder2...]
```

## API

```js
const fusv = require('find-unused-sass-variables')
// 'scss' is a folder
const unused = fusv.find('scss')
// Array of unused variables
console.log(unused.unused);
// [ '$foo', '$bar', '$imunused' ]
console.log(unused.total);
// 3
```

### find([dir])

* `dir`: string
* Returns an object with `unused` and `total`. `unused` has the array of unused variables and `total` their count.

### Ignore variables

```shell
fusv folder --ignore '$my-var,$my-second-var'
```
Or

```js
const fusv = require('find-unused-sass-variables')
const ignoredVars = ['$my-var', '$my-second-var']
  
const unused = fusv.find('scss', { ignoredVars })
```


## Notes

* The tool's logic is pretty "dumb"; if you use the same name for a variable in different files or namespaces,
  then it won't distinguish between them.
* The tool only looks for `.scss` files currently.

## License

MIT
