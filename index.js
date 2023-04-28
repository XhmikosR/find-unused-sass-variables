import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import glob from 'glob';
import escapeRegex from 'escape-string-regexp';
import stripBom from 'strip-bom';
import { parse } from './lib/parse-variable.js';

const globP = promisify(glob);

const defaultOptions = {
  ignore: [],
  ignoreFiles: [],
  fileExtensions: ['scss']
};

const findAsync = async(strDir, opts = {}) => {
  const options = parseOptions(opts);
  const dir = await sanitizeDirAsync(strDir);
  // Array of all Sass files
  const sassFiles = await globP(
    path.join(dir, `**/*.${options.fileExtensions}`),
    { ignore: options.ignoreFiles }
  );

  const executions = sassFiles.map(file => parseFileAsync(file, options));
  // String of all Sass files' content
  const sassFilesString = await Promise.all(executions);
  return makeResults(sassFilesString);
};

const findSync = (strDir, opts = {}) => {
  const options = parseOptions(opts);
  const dir = sanitizeDirSync(strDir);
  // Array of all Sass files
  const sassFiles = glob.sync(
    path.join(dir, `**/*.${options.fileExtensions}`),
    { ignore: options.ignoreFiles }
  );

  const sassFilesString = sassFiles.map(file => parseFileSync(file, options));

  return makeResults(sassFilesString);
};

function makeResults(sassFilesString) {
  let variables = [];
  let combinedSassFile = '';

  for (const result of sassFilesString) {
    variables = [...variables, ...result.variables];
    combinedSassFile += result.sassFileString;
  }

  return filterVariables(combinedSassFile, variables);
}

const parseFileAsync = async(file, options) => {
  const sassFileString = await fs.promises.readFile(file, 'utf8');
  return parseData(file, sassFileString, options);
};

const parseFileSync = (file, options) => {
  const sassFileString = fs.readFileSync(file, 'utf8');
  return parseData(file, sassFileString, options);
};

const parseData = (fileName, content, options) => {
  const sassFileString = stripBom(content) // Strip BOM mark
    .replace(/^---$/gm, ''); // Remove (Jekyll, YAML) front-matter comments
  const variables = parse(fileName, sassFileString, options.ignore);

  return {
    sassFileString,
    variables
  };
};

const filterVariables = (sassFilesString, variables) => {
  // Store unused vars from all files and loop through each variable
  const unusedVars = variables.filter(variable => {
    const re = new RegExp(`(${escapeRegex(variable.name)})\\b(?!-)`, 'g');
    return sassFilesString.match(re).length === 1;
  });

  return {
    unused: unusedVars,
    total: variables.length
  };
};

const parseOptions = (opts = {}) => {
  const options = { ...defaultOptions, ...opts };

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
  // Replace possible fullstop prefix
  extensions = extensions.map(ext => ext.startsWith('.') ? ext.slice(1) : ext);
  // The following is glob-specific syntax
  options.fileExtensions = extensions.length > 1 ? `+(${extensions.join('|')})` : extensions;

  return options;
};

const sanitizeDirAsync = async strDir => {
  const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);
  const stat = await fs.promises.lstat(dir);

  return checkDir(stat, dir);
};

const sanitizeDirSync = strDir => {
  const dir = path.isAbsolute(strDir) ? strDir : path.resolve(strDir);
  const stat = fs.statSync(dir);

  return checkDir(stat, dir);
};

function checkDir(stat, dir) {
  if (!stat.isDirectory()) {
    throw new Error(`"${dir}": Not a valid directory!`);
  }

  return dir;
}

export {
  findSync as find,
  findAsync
};
