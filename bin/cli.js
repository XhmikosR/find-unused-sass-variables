#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { program } from 'commander';
import picocolors from 'picocolors';
import { findAsync } from '../index.js';

const pkg = new URL('../package.json', import.meta.url);
const { name, version, description } = JSON.parse(await fs.readFile(pkg));

program
  .name(name)
  .argument('<folders>', 'folders to include, space separated')
  .description(description)
  .version(version, '-v, --version')
  .option('-i, --ignore <variables>', 'ignore variables, comma separated', '')
  .option('-if, --ignoreFiles <files>', 'ignore files, comma separated', '')
  .option('-e, --extension [types...]', 'file extensions to search', ['scss'])
  .action((name, options) => {
    console.log('Looking for unused variables');

    for (const option of ['ignore', 'ignoreFiles']) {
      options[option] = options[option].split(',');
    }
  })
  .showHelpAfterError()
  .parse();

async function main() {
  const directories = program.args;
  const { ignore, ignoreFiles, extension: fileExtensions } = program.opts();
  const options = {
    ignore,
    ignoreFiles,
    fileExtensions
  };

  const executions = await Promise.allSettled(
    directories.map(path => executeForPath(path, options))
  );
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
  const unusedVars = await findAsync(dir, options);
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

main();
