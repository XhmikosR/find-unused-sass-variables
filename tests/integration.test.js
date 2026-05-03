import assert from 'node:assert/strict';
import { suite } from 'uvu';
import { find, findAsync } from '../index.js';

const test = suite('integration');

const ignore = ['$ignored-variable'];
const ignoreFiles = ['**/ignored-file*.scss'];

const expectedUnused = [
  '$a',
  '$b',
  '$black',
  '$enabled-variable',
  '$nestNestedVar',
  '$nestedVar',
  '$one-unused',
  '$unused'
];

const expectedUnusedFiltered = [
  '$black',
  '$enabled-variable',
  '$nestNestedVar',
  '$nestedVar',
  '$one-unused',
  '$unused'
];

const allExpectedUnused = [
  '$a',
  '$b',
  '$black',
  '$enabled-variable',
  '$ignored-variable',
  '$nestNestedVar',
  '$nestedVar',
  '$one-unused',
  '$unused'
];

test('find (sync) returns expected unused variable names', () => {
  const result = find('./tests/', { ignore, ignoreFiles });
  assert.deepEqual(result.unused.map(v => v.name).sort(), expectedUnused);
});

test('findAsync returns expected unused variable names', async() => {
  const result = await findAsync('./tests/', { ignore, ignoreFiles });
  assert.deepEqual(result.unused.map(v => v.name).sort(), expectedUnused);
});

test('disabled variables are excluded from results', () => {
  const result = find('./tests/', { ignore, ignoreFiles });
  const names = new Set(result.unused.map(v => v.name));
  assert.equal(names.has('$disabled-variable'), false);
  assert.equal(names.has('$block-disabled-variable'), false);
  assert.equal(names.has('$leak-test'), false);
});

test('ignore option filters specified variables', () => {
  const result = find('./tests/', {
    ignore: ['$ignored-variable', '$a', '$b'],
    ignoreFiles
  });
  assert.deepEqual(result.unused.map(v => v.name).sort(), expectedUnusedFiltered);
});

test('ignoreFiles option excludes matched files', () => {
  const result = find('./tests/', { ignoreFiles });
  assert.deepEqual(result.unused.map(v => v.name).sort(), allExpectedUnused);
  const names = new Set(result.unused.map(v => v.name));
  assert.equal(names.has('$unused-but-ignored'), false);
  assert.equal(names.has('$unused-but-ignored2'), false);
});

test('fileExtensions with css finds nothing in scss fixtures', () => {
  const result = find('./tests/', { ignoreFiles, fileExtensions: ['css'] });
  assert.equal(result.total, 0);
  assert.equal(result.unused.length, 0);
});

test('fileExtensions with multiple extensions finds scss vars', () => {
  const result = find('./tests/', { ignoreFiles, fileExtensions: ['css', 'scss'] });
  assert.deepEqual(result.unused.map(v => v.name).sort(), allExpectedUnused);
});

test('fileExtensions with leading dot works', () => {
  const result = find('./tests/', { ignoreFiles, fileExtensions: '.scss' });
  assert.deepEqual(result.unused.map(v => v.name).sort(), allExpectedUnused);
});

test('each unused entry has name, line, and file properties', () => {
  const result = find('./tests/', { ignore, ignoreFiles });
  for (const entry of result.unused) {
    assert.equal(typeof entry.name, 'string');
    assert.equal(typeof entry.line, 'number');
    assert.equal(typeof entry.file, 'string');
    assert.equal(entry.name.startsWith('$'), true);
    assert.equal(entry.line >= 1, true);
  }
});

test('variable declared in one file but used in another is not flagged', () => {
  // $white, $black-light, $black-lightest are declared in _variables.scss
  // and used in test.scss - they must not appear in unused
  const result = find('./tests/', { ignore, ignoreFiles });
  const unusedNames = new Set(result.unused.map(v => v.name));
  assert.equal(unusedNames.has('$white'), false);
  assert.equal(unusedNames.has('$black-light'), false);
  assert.equal(unusedNames.has('$black-lightest'), false);
});

test.run();
