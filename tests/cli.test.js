import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import process from 'node:process';
import assert from 'node:assert/strict';
import { suite } from 'uvu';

const exec = promisify(execFile);
const cli = fileURLToPath(new URL('../bin/cli.js', import.meta.url));

// Total declared in tests with ignoreFiles applied without ignores
const TOTAL_UNUSED = 9;
// After --ignore=$a,$b
const TOTAL_UNUSED_WITH_IGNORE = 7;

async function run(...args) {
  // Disable color in test output for easier assertions
  const env = { ...process.env, NO_COLOR: '1' };

  try {
    const { stdout, stderr } = await exec(process.execPath, [cli, ...args], { env });
    return { code: 0, stdout, stderr };
  } catch(error) {
    return {
      code: error.code,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? ''
    };
  }
}

const test = suite('cli');

test('exits 1 when unused variables are found', async() => {
  const { code } = await run('tests/');
  assert.equal(code, 1);
});

test('exits 0 when all variables are used', async() => {
  const { code, stdout } = await run('tests/fixtures/all-used/');
  assert.equal(code, 0);
  assert.equal(stdout.includes('No unused variables'), true);
});

test('exits 1 for a non-existent directory', async() => {
  const { code } = await run('tests/fixtures/does-not-exist/');
  assert.equal(code, 1);
});

test('--ignore filters out specified variables', async() => {
  const { code, stdout } = await run(
    'tests/',
    '--ignore=$a,$b',
    '--ignoreFiles=**/ignored-file*.scss'
  );
  assert.equal(code, 1);
  assert.equal(stdout.includes(`${TOTAL_UNUSED_WITH_IGNORE} unused`), true);
});

test('--ignoreFiles excludes matched files', async() => {
  const { code, stdout } = await run('tests/', '--ignoreFiles=**/ignored-file*.scss');
  assert.equal(code, 1);
  assert.equal(stdout.includes(`${TOTAL_UNUSED} unused`), true);
  assert.equal(stdout.includes('unused-but-ignored'), false);
});

test('--extension with non-matching type exits 0', async() => {
  const { code } = await run('tests/fixtures/all-used/', '--extension', 'css');
  assert.equal(code, 0);
});

test('reports singular "variable" when exactly one is unused', async() => {
  const { code, stderr } = await run('tests/fixtures/one-unused/');
  assert.equal(code, 1);
  assert.equal(stderr.includes('Found 1 unused variable '), true);
  assert.equal(stderr.includes('Found 1 unused variables'), false);
});

test('accepts multiple folder arguments', async() => {
  const { code, stdout } = await run(
    'tests/fixtures/all-used/',
    'tests/fixtures/all-used/'
  );
  assert.equal(code, 0);
  assert.equal((stdout.match(/No unused variables/g) ?? []).length, 2);
});

test('--css-variables exits 0 when no css vars present', async() => {
  const { code } = await run('tests/fixtures/all-used/', '--css-variables');
  assert.equal(code, 0);
});

test('--css-variables exits 1 when unused custom property found', async() => {
  const { code, stdout } = await run('tests/fixtures/css-vars/', '--css-variables');
  assert.equal(code, 1);
  assert.equal(stdout.includes('--unused-color'), true);
});

test('without --css-variables, css-vars fixture exits 0', async() => {
  const { code } = await run('tests/fixtures/css-vars/');
  assert.equal(code, 0);
});

test.run();
