#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { program } from 'commander';
import picocolors from 'picocolors';
import fusv from './index.js';

const { version } = JSON.parse(await fs.readFile(new URL('package.json', import.meta.url)));

program
  .arguments('[folders]')
  .version(version, '-v, --version')
  .option('-i, --ignore <ignoredVars>', 'ignore variables, comma separated', '')
  .option('-if, --ignoreFiles <ignoredVars>', 'ignore files, comma separated', '')
  .option('-e, --extension [fileTypes...]', 'file extension to search', ['scss'])
  .parse();

async function main() {
  const directories = program.args;
  const { ignore, ignoreFiles, extension: fileExtensions } = program.opts();
  const options = {
    ignore: ignore.split(','),
    ignoreFiles: ignoreFiles.split(','),
    fileExtensions
  };

  console.log('Looking for unused variables');

  const executions = await Promise.allSettled(directories.map(path => executeForPath(path, options)));
  let status = 0;

  for (const result of executions) {
    if (result.status === 'rejected') {
      console.log(picocolors.red(result.reason));
      status = 1;
    }
  }

  process.exit(status);
}

const executeForPath = async(arg, options) => {
  const dir = path.resolve(arg);
  const unusedVars = await fusv.findAsync(dir, options);
  const unusedVarsNumber = unusedVars.unused.length;

  console.log(`\nSearching for unused variables in "${picocolors.cyan(dir)}" folder, ${picocolors.cyan(options.fileExtensions.join(', '))} files...`);

  if (unusedVarsNumber > 0) {
    console.log(`${picocolors.cyan(unusedVars.total)} total variables, ${picocolors.red(unusedVarsNumber)} unused:`);
    for (const { name, file, line } of unusedVars.unused) {
      console.log(`  - ${picocolors.red(name)} ${picocolors.gray(file)}:${picocolors.cyan(line)}`);
    }

    throw new Error(`Found ${unusedVarsNumber} unused variable${unusedVarsNumber > 1 ? 's' : ''} in "${picocolors.cyan(dir)}" folder`);
  }

  console.log(`${picocolors.cyan(unusedVars.total)} total variables`);
  console.log(picocolors.green(`No unused variables found in "${picocolors.cyan(dir)}"!`));
};

const args = program.args.filter(arg => typeof arg === 'string');

if (args.length > 0) {
  main();
} else {
  program.help();
}
