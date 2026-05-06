import { readFileSync, statSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import slash from 'slash';
import stripBom from 'strip-bom';
import { glob, globSync } from 'tinyglobby';
import { aggregateResults } from './lib/filter.js';
import { parse } from './lib/parse-variable.js';

const defaultOptions = {
  ignore: [],
  ignoreFiles: [],
  fileExtensions: ['scss'],
  cssVariables: false
};

function buildGlobPattern(dir, options) {
  return slash(path.join(dir, `**/*.${options.fileExtensions}`));
}

async function findAsync(dirPath, opts = {}) {
  const options = parseOptions(opts);
  const dir = path.resolve(dirPath);
  const dirStat = await stat(dir);

  if (!dirStat.isDirectory()) {
    throw new Error(`"${dir}": Not a valid directory!`);
  }

  // Array of all Sass files
  const sassFiles = await glob(
    buildGlobPattern(dir, options),
    { ignore: options.ignoreFiles, expandDirectories: false }
  );

  const parsePromises = sassFiles.map(file => parseFileAsync(file, options));
  // Parsed content and variables from each file
  const parsedFiles = await Promise.all(parsePromises);
  return aggregateResults(parsedFiles);
}

function findSync(dirPath, opts = {}) {
  const options = parseOptions(opts);
  const dir = path.resolve(dirPath);
  const dirStat = statSync(dir);

  if (!dirStat.isDirectory()) {
    throw new Error(`"${dir}": Not a valid directory!`);
  }

  // Array of all Sass files
  const sassFiles = globSync(
    buildGlobPattern(dir, options),
    { ignore: options.ignoreFiles, expandDirectories: false }
  );

  const parsedFiles = sassFiles.map(file => parseFileSync(file, options));

  return aggregateResults(parsedFiles);
}

async function parseFileAsync(file, options) {
  const content = await readFile(file, 'utf8');
  return parseFileContent(file, content, options.ignore, options.cssVariables);
}

function parseFileSync(file, options) {
  const content = readFileSync(file, 'utf8');
  return parseFileContent(file, content, options.ignore, options.cssVariables);
}

function parseFileContent(fileName, content, ignoreList, cssVariables) {
  const fileContent = stripBom(content) // Strip BOM mark
    .replaceAll(/^---$/gm, ''); // Remove (Jekyll, YAML) front-matter comments

  return parse(fileName, fileContent, ignoreList, cssVariables);
}

function parseOptions(opts) {
  opts ??= {};
  const options = {
    ignore: opts.ignore ?? defaultOptions.ignore,
    ignoreFiles: opts.ignoreFiles ?? defaultOptions.ignoreFiles,
    fileExtensions: opts.fileExtensions ?? defaultOptions.fileExtensions,
    cssVariables: opts.cssVariables ?? defaultOptions.cssVariables
  };

  for (const option of ['ignore', 'ignoreFiles']) {
    if (!Array.isArray(options[option])) {
      throw new TypeError(`\`${option}\` should be an Array`);
    }
  }

  // Trim list of ignored variables
  options.ignore = options.ignore.map(val => val.trim());
  // Trim list of ignored files
  options.ignoreFiles = options.ignoreFiles.map(val => val.trim());

  let extensions = options.fileExtensions;

  extensions = Array.isArray(extensions) ? extensions : [extensions];
  // Trim, strip a leading dot, and drop blanks
  extensions = extensions
    .map(extension => {
      const trimmed = extension.trim();
      return trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
    })
    .filter(Boolean);

  if (extensions.length === 0) {
    throw new TypeError('`fileExtensions` must contain at least one non-empty extension');
  }

  // The following is glob-specific syntax
  options.fileExtensions = extensions.length > 1 ? `+(${extensions.join('|')})` : extensions[0];

  return options;
}

export {
  findSync as find,
  findAsync
};
