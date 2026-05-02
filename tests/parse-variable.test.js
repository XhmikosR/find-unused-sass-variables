import assert from 'node:assert/strict';
import { suite } from 'uvu';
import { parse } from '../lib/parse-variable.js';

const test = suite('parse-variable');

test('returns declared variables', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const variables = parse('f.scss', scss, []);
  assert.deepEqual(variables.map(v => v.name), ['$a', '$b']);
});

test('returns correct line numbers', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const variables = parse('f.scss', scss, []);
  assert.equal(variables[0].line, 2);
  assert.equal(variables[1].line, 3);
});

test('returns correct file name', () => {
  const variables = parse('my-file.scss', '$a: 1px;', []);
  assert.equal(variables[0].file, 'my-file.scss');
});

test('excludes variables in ignoreList', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const variables = parse('f.scss', scss, ['$a']);
  assert.deepEqual(variables.map(v => v.name), ['$b']);
});

test('ignores non-variable declarations', () => {
  const scss = `
.foo { color: red; }
$a: 1px;
`;
  const variables = parse('f.scss', scss, []);
  assert.deepEqual(variables.map(v => v.name), ['$a']);
});

test('fusv-disable with inline // comment suppresses variables', () => {
  const scss = `
$x: 1px;
// fusv-disable
$y: 2px;
// fusv-enable
$z: 3px;
`;
  const variables = parse('f.scss', scss, []);
  assert.deepEqual(variables.map(v => v.name), ['$x', '$z']);
});

test('fusv-disable with block /* */ comment suppresses variables', () => {
  const scss = `
$x: 1px;
/* fusv-disable */
$y: 2px;
/* fusv-enable */
$z: 3px;
`;
  const variables = parse('f.scss', scss, []);
  assert.deepEqual(variables.map(v => v.name), ['$x', '$z']);
});

test('fusv-enable state resets between parse() calls', () => {
  const scss = `
$x: 1px;
// fusv-disable
$y: 2px;
`;
  parse('f1.scss', scss, []);
  const variables = parse('f2.scss', '$z: 3px;', []);
  assert.deepEqual(variables.map(v => v.name), ['$z']);
});

test('finds variables nested inside rules', () => {
  const scss = `
.foo {
  $nested: red;
}
`;
  const variables = parse('f.scss', scss, []);
  assert.deepEqual(variables.map(v => v.name), ['$nested']);
});

test.run();
