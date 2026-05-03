# find-unused-sass-variables

[![npm version](https://img.shields.io/npm/v/find-unused-sass-variables?logo=npm&logoColor=fff)](https://www.npmjs.com/package/find-unused-sass-variables)
[![Build Status](https://img.shields.io/github/actions/workflow/status/XhmikosR/find-unused-sass-variables/test.yml?branch=main&label=CI&logo=github)](https://github.com/XhmikosR/find-unused-sass-variables/actions/workflows/test.yml?query=branch%3Amain)

A small tool to find unused Sass variables in a directory.

## Install

```shell
npm install find-unused-sass-variables --save-dev
```

## CLI

### Usage

```shell
fusv <folders...> [options]
# or the full alias
find-unused-sass-variables <folders...> [options]
```

One or more folder paths can be passed at once.

### Options

| Flag | Alias | Description | Default |
|---|---|---|---|
| `--ignore <variables>` | `-i` | Comma-separated variable names to skip (e.g. `$my-var,$another`) | - |
| `--ignoreFiles <files>` | `-if` | Comma-separated file glob patterns to skip (e.g. `**/_variables.scss`) | - |
| `--extension [types...]` | `-e` | File extension(s) to scan. Repeatable or comma-separated. | `scss` |
| `--help` | | Print help | - |

### Examples

```shell
# Scan a single folder
fusv src/

# Scan multiple folders
fusv src/ themes/

# Ignore specific variables
fusv src/ --ignore='$my-var,$another-var'

# Ignore files matching a glob
fusv src/ --ignoreFiles='**/_variables.scss'

# Scan .scss and .css files
fusv src/ -e scss -e css

# Combine options
fusv src/ --ignore='$unused' --ignoreFiles='**/vendor/**' -e scss -e sass
```

> **Shell quoting**
> On Unix/macOS, quote the value to prevent the shell from expanding `$` (e.g. `--ignore='$my-var'`).
> On Windows CMD, no quoting is needed (e.g. `--ignore=$my-var`).

### Exit codes

| Code | Meaning |
|---|---|
| `0` | No unused variables found |
| `1` | One or more unused variables found (or an error occurred) |

## API

```js
import { find, findAsync } from 'find-unused-sass-variables';
```

### `find(dir, options?)`

Synchronous. Scans `dir` and returns the result immediately.

```ts
find(dir: string, options?: Options): Result
```

### `findAsync(dir, options?)`

Asynchronous. Same behaviour as `find`, but returns a `Promise`.

```ts
findAsync(dir: string, options?: Options): Promise<Result>
```

### Options

| Property | Type | Description | Default |
|---|---|---|---|
| `ignore` | `string[]` | Variable names to skip, e.g. `['$my-var', '$brand-color']` | `[]` |
| `ignoreFiles` | `string[]` | File glob patterns to skip, e.g. `['**/_variables.scss']` | `[]` |
| `fileExtensions` | `string[]` | Extensions to scan (leading dot optional), e.g. `['scss', 'css']` | `['scss']` |

### Return value

Both functions return (or resolve to):

| Property | Type | Description |
|---|---|---|
| `unused` | `{ name: string, file: string, line: number }[]` | Variables declared but never referenced |
| `total` | `number` | Total variables found across all scanned files |

Each entry in `unused`:

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Variable name, e.g. `'$my-color'` |
| `file` | `string` | Path to the file containing the variable |
| `line` | `number` | Line number of the variable |

### Examples

**Synchronous**

```js
import { find } from 'find-unused-sass-variables';

const result = find('src/');
console.log(result.total);   // total variables found
console.log(result.unused);  // [{ name: '$unused-color', file: 'src/_colors.scss', line: 12 }, ...]
```

**Asynchronous**

```js
import { findAsync } from 'find-unused-sass-variables';

const result = await findAsync('src/');
console.log(result.total);
console.log(result.unused);
```

**With options**

```js
import { find } from 'find-unused-sass-variables';

const result = find('src/', {
  ignore: ['$my-var', '$brand-color'],
  ignoreFiles: ['**/_variables.scss', '**/vendor/**'],
  fileExtensions: ['scss', 'css']
});
```

## Disable and enable scanning

Wrap any region with `fusv-disable` / `fusv-enable` comments to exclude those variables from analysis. Both inline (`//`) and block (`/* */`) comment styles are supported.

```scss
$used-variable-1: #666;

// fusv-disable
$intentionally-unused: #coffee; // will NOT be reported
// fusv-enable

$used-variable-2: #ace;
```

```scss
/* fusv-disable */
$intentionally-unused: #coffee;
/* fusv-enable */
```

## Notes

* The tool's logic is pretty "dumb"; if you use the same name for a variable in different files or namespaces,
  then it won't distinguish between them.
* The tool only looks for `.scss` files by default, but you can optionally specify the file extensions.

## License

[MIT](LICENSE)
