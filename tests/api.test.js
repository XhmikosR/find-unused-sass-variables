import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { suite } from 'uvu';
import { find, findAsync } from '../index.js';

const fixturesDir = path.resolve(fileURLToPath(new URL('fixtures/all-used', import.meta.url)));

const test = suite('api');

test('throws TypeError when ignore is not an array', () => {
  assert.throws(
    () => find(fixturesDir, { ignore: '$a' }),
    TypeError
  );
});

test('throws TypeError when ignoreFiles is not an array', () => {
  assert.throws(
    () => find(fixturesDir, { ignoreFiles: '$a' }),
    TypeError
  );
});

test('throws when directory does not exist', async() => {
  await assert.rejects(
    () => findAsync('./tests/fixtures/does-not-exist/')
  );
});

test('throws when path is a file not a directory (async)', async() => {
  await assert.rejects(
    () => findAsync('./index.js'),
    { message: /Not a valid directory/ }
  );
});

test('throws when path is a file not a directory (sync)', () => {
  assert.throws(
    () => find('./index.js'),
    { message: /Not a valid directory/ }
  );
});

test('find (sync) returns unused and total', () => {
  const result = find(fixturesDir);
  assert.equal(result.unused.length, 0);
  assert.equal(result.total, 2);
});

test('findAsync returns unused and total', async() => {
  const result = await findAsync(fixturesDir);
  assert.equal(result.unused.length, 0);
  assert.equal(result.total, 2);
});

test('fileExtensions accepts a string with a leading dot', () => {
  const result = find(fixturesDir, { fileExtensions: '.scss' });
  assert.equal(result.total, 2);
});

test('fileExtensions accepts an array', () => {
  const result = find(fixturesDir, { fileExtensions: ['scss'] });
  assert.equal(result.total, 2);
});

test('fileExtensions with non-matching extension finds nothing', () => {
  const result = find(fixturesDir, { fileExtensions: ['css'] });
  assert.equal(result.total, 0);
});

test('throws TypeError when fileExtensions is an empty array', () => {
  assert.throws(() => {
    find(fixturesDir, { fileExtensions: [] });
  }, TypeError);
});

test('throws TypeError when fileExtensions contains only blank strings', () => {
  assert.throws(() => {
    find(fixturesDir, { fileExtensions: ['  '] });
  }, TypeError);
});

test('fileExtensions with surrounding whitespace is trimmed and works', () => {
  const result = find(fixturesDir, { fileExtensions: [' scss '] });
  assert.equal(result.total, 2);
});

test('find accepts null opts without throwing', () => {
  const result = find(fixturesDir, null);
  assert.equal(result.total, 2);
});

test('find accepts undefined opts without throwing', () => {
  const result = find(fixturesDir, undefined);
  assert.equal(result.total, 2);
});

test.run();
