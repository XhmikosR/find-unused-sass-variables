import fs from 'node:fs';
import path from 'node:path';
import escapeRegex from 'escape-string-regexp';
import { totalist } from 'totalist';
// eslint-disable-next-line n/file-extension-in-import
import { totalist as totalistSync } from 'totalist/sync';
import parse from './lib/parse-variable.js';

const defaultOptions = {
  ignore: [],
  fileExtensions: ['scss']
};

const findUnusedVarsAsync = async(strDir, opts) => {
  const options = parseOptions(opts);
  const dir = await sanitizeDirAsync(strDir);
  // Array of all Sass files
  const sassFiles = [];

  await totalist(dir, (_relPath, absPath) => {
    for (const extension of options.fileExtensions) {
      if (absPath.endsWith(extension)) {
        sassFiles.push(absPath);
      }
    }
  });

  const executions = sassFiles.map(file => parseFileAsync(file, options));
  // String of all Sass files' content
  const sassFilesAsStrings = await Promise.all(executions);

  return makeResults(sassFilesAsStrings);
};

const findUnusedVarsSync = (strDir, opts) => {
  const options = parseOptions(opts);
  const dir = sanitizeDirSync(strDir);
  // Array of all Sass files
  const sassFiles = [];

  totalistSync(dir, (_relPath, absPath) => {
    for (const extension of options.fileExtensions) {
      if (absPath.endsWith(extension)) {
        sassFiles.push(absPath);
      }
    }
  });

  // String of all Sass files' content
  const sassFilesAsStrings = sassFiles.map(file => parseFileSync(file, options));

  return makeResults(sassFilesAsStrings);
};

function makeResults(sassFilesAsStrings) {
  let variables = [];
  let combinedSassFile = '';

  for (const result of sassFilesAsStrings) {
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

const parseData = (fileName, sassFileString, options) => {
  // Remove jekyll comments
  if (sassFileString.includes('---')) {
    sassFileString = sassFileString.replace(/---/g, '');
  }

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

const parseOptions = opts => {
  const options = { ...defaultOptions, ...opts };

  if (Boolean(options.ignore) && !Array.isArray(options.ignore)) {
    throw new TypeError('`ignore` should be an Array');
  }

  // Trim list of ignored variables
  options.ignore = options.ignore.map(val => val.trim());

  let extensions = options.fileExtensions;
  // Make sure extensions is an array
  extensions = Array.isArray(extensions) ? extensions : [extensions];
  // Add missing fullstop prefix
  extensions = extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
  options.fileExtensions = extensions;

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

// TODO: switch to named exports in the next major version
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  findAsync: findUnusedVarsAsync,
  find: findUnusedVarsSync
};
