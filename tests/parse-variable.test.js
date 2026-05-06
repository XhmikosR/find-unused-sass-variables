import assert from 'node:assert/strict';
import { suite } from 'uvu';
import { parse } from '../lib/parse-variable.js';

const test = suite('parse-variable');

test('returns declared variables', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const result = parse('f.scss', scss, []);
  const expected = ['$a', '$b'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('returns correct line numbers', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.variables[0].line, 2);
  assert.equal(result.variables[1].line, 3);
});

test('returns correct file name', () => {
  const result = parse('my-file.scss', '$a: 1px;', []);
  assert.equal(result.variables[0].file, 'my-file.scss');
});

test('excludes variables in ignoreList', () => {
  const scss = `
$a: 1px;
$b: 2px;
`;
  const result = parse('f.scss', scss, ['$a']);
  const expected = ['$b'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('ignores non-variable variables', () => {
  const scss = `
.foo { color: red; }
$a: 1px;
`;
  const result = parse('f.scss', scss, []);
  const expected = ['$a'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('fusv-disable with inline // comment suppresses variables', () => {
  const scss = `
$x: 1px;
// fusv-disable
$y: 2px;
// fusv-enable
$z: 3px;
`;
  const result = parse('f.scss', scss, []);
  const expected = ['$x', '$z'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('fusv-disable with block /* */ comment suppresses variables', () => {
  const scss = `
$x: 1px;
/* fusv-disable */
$y: 2px;
/* fusv-enable */
$z: 3px;
`;
  const result = parse('f.scss', scss, []);
  const expected = ['$x', '$z'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('fusv-enable state resets between parse() calls', () => {
  const scss = `
$x: 1px;
// fusv-disable
$y: 2px;
`;
  parse('f1.scss', scss, []);
  const result = parse('f2.scss', '$z: 3px;', []);
  const expected = ['$z'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('finds variables nested inside rules', () => {
  const scss = `
.foo {
  $nested: red;
}
`;
  const result = parse('f.scss', scss, []);
  const expected = ['$nested'];
  assert.deepEqual(result.variables.map(v => v.name), expected);
});

test('variable name in a comment does not appear in usages', () => {
  const scss = `
$a: 1px;
// $a is the spacing token
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$a'), false);
});

test('variable used in interpolated property name counts as used', () => {
  const scss = `
$prefix: bs-;
$css-variable-name: color;
.c {
  --#{$prefix}#{$css-variable-name}: red;
}
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$prefix'), true);
  assert.equal(result.usages.has('$css-variable-name'), true);
});

test('variable used only in declaration value is not double-counted as a variable', () => {
  const scss = `
$a: 1px;
.c {
  color: $a;
}
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.variables.length, 1);
  assert.equal(result.usages.has('$a'), true);
});

test('mixin parameter name does not pollute usages - global with same name stays unused', () => {
  const scss = `
$color: red;
@mixin themed($color: blue) {
  font-size: 1px;
}
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$color'), false);
});

test('mixin default value counts as a usage', () => {
  const scss = `
$default-color: red;
@mixin themed($color: $default-color) { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$color'), false);
  assert.equal(result.usages.has('$default-color'), true);
});

test('mixin default value with nested function call counts as a usage', () => {
  // $opacity is a global used in the default value - must be detected as used.
  // $color appears in the default of $bg but is itself a parameter, not a global.
  // $state and $bg are plain parameters with no defaults.
  const scss = `
$opacity: 0.5;
@mixin form-validation-state(
  $state,
  $color,
  $bg: rgba($color, $opacity)
) { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$opacity'), true);
  assert.equal(result.usages.has('$state'), false);
  assert.equal(result.usages.has('$bg'), false);
});

test('function parameter name does not pollute usages', () => {
  const scss = `
$x: 10px;
@function double($x) {
  @return 1px;
}
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$x'), false);
});

test('function default value counts as a usage', () => {
  const scss = `
$base: 10px;
@function scale($x: $base) { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$base'), true);
  assert.equal(result.usages.has('$x'), false);
});

test('@each loop variable does not pollute usages', () => {
  const scss = `
$item: red;
$list: (a, b, c);
@each $item in $list {
  color: green;
}
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$list'), true);
  assert.equal(result.usages.has('$item'), false);
});

test('@each multi-variable loop variables do not pollute usages', () => {
  const scss = `
$key: x;
$val: y;
$map: (a: 1, b: 2);
@each $key, $val in $map { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$map'), true);
  assert.equal(result.usages.has('$key'), false);
  assert.equal(result.usages.has('$val'), false);
});

test('@for loop variable does not pollute usages', () => {
  const scss = `
$i: 0;
@for $i from 1 through 3 { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$i'), false);
});

test('@for bound variables count as usages', () => {
  const scss = `
$start: 1;
$end: 10;
@for $i from $start through $end { }
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$i'), false);
  assert.equal(result.usages.has('$start'), true);
  assert.equal(result.usages.has('$end'), true);
});

test('fusv-disable inside a nested rule suppresses variables', () => {
  const scss = `
$outer: red;
.foo {
  // fusv-disable
  $inner: blue;
  // fusv-enable
}
$after: green;
`;
  const result = parse('f.scss', scss, []);
  assert.deepEqual(result.variables.map(v => v.name), ['$outer', '$after']);
});

test('fusv-disable without fusv-enable suppresses until end of file', () => {
  const scss = `
$before: red;
// fusv-disable
$suppressed: blue;
`;
  const result = parse('f.scss', scss, []);
  assert.deepEqual(result.variables.map(v => v.name), ['$before']);
});

test('variable used in @warn counts as a usage', () => {
  const result = parse('f.scss', '@warn $msg;', []);
  assert.equal(result.usages.has('$msg'), true);
});

test('variable used in @error counts as a usage', () => {
  const result = parse('f.scss', '@error $msg;', []);
  assert.equal(result.usages.has('$msg'), true);
});

test('variable used in @debug counts as a usage', () => {
  const result = parse('f.scss', '@debug $val;', []);
  assert.equal(result.usages.has('$val'), true);
});

test('@mixin with no argument list does not throw', () => {
  const result = parse('f.scss', '@mixin foo { color: red; }', []);
  assert.equal(result.variables.length, 0);
  assert.equal(result.usages.size, 0);
});

test('@each with no "in" keyword does not throw', () => {
  const result = parse('f.scss', '@each $item { }', []);
  assert.equal(result.usages.has('$item'), false);
});

test('variable used in @forward params counts as a usage', () => {
  const result = parse('f.scss', '@forward \'vars\' show $color;', []);
  assert.equal(result.usages.has('$color'), true);
});

test('variable with !default referencing another variable counts as a usage', () => {
  const scss = `
$y: blue;
$x: $y !default;
`;
  const result = parse('f.scss', scss, []);
  assert.equal(result.usages.has('$y'), true);
});

// CSS custom properties
test('--var decl ignored when cssVariables is false (default)', () => {
  const result = parse('f.scss', '--color: red;', []);
  assert.equal(result.variables.length, 0);
});

test('--var decl collected when cssVariables is true', () => {
  const result = parse('f.scss', '--color-primary: red;', [], true);
  assert.equal(result.variables.length, 1);
  assert.equal(result.variables[0].name, '--color-primary');
});

test('--var decl records correct line and file', () => {
  const scss = `
--color: red;
`;
  const result = parse('my.scss', scss, [], true);
  assert.equal(result.variables[0].file, 'my.scss');
  assert.equal(result.variables[0].line, 2);
});

test('--var decl excluded when in ignoreList', () => {
  const result = parse('f.scss', '--color: red;', ['--color'], true);
  assert.equal(result.variables.length, 0);
});

test('var(--name) usage detected', () => {
  const result = parse('f.scss', '.a { color: var(--color); }', [], true);
  assert.equal(result.usages.has('--color'), true);
});

test('var(--name, fallback) captures only the name', () => {
  const result = parse('f.scss', '.a { color: var(--color, #fff); }', [], true);
  assert.equal(result.usages.has('--color'), true);
  assert.equal(result.usages.has('--color, #fff'), false);
});

test('var() in at-rule params is detected', () => {
  const scss = '@media (min-width: var(--bp)) { .a { color: red; } }';
  const result = parse('f.scss', scss, [], true);
  assert.equal(result.usages.has('--bp'), true);
});

test('fusv-disable suppresses --var decl', () => {
  const scss = `
// fusv-disable
--x: red;
// fusv-enable
--y: blue;
`;
  const result = parse('f.scss', scss, [], true);
  assert.deepEqual(result.variables.map(v => v.name), ['--y']);
});

test('$sass-var and --var both collected when cssVariables is true', () => {
  const scss = `
$a: 1px;
--b: red;
`;
  const result = parse('f.scss', scss, [], true);
  assert.deepEqual(result.variables.map(v => v.name), ['$a', '--b']);
});

test('--var decl nested in a rule is collected', () => {
  const scss = `
.foo {
  --nested: red;
}
`;
  const result = parse('f.scss', scss, [], true);
  assert.equal(result.variables[0].name, '--nested');
});

test('interpolated --#{$x}-color prop is not tracked as a CSS var', () => {
  const scss = `
$prefix: bs;
.c {
  --#{$prefix}-color: red;
}
`;
  const result = parse('f.scss', scss, [], true);
  // $prefix is a Sass variable; the interpolated -- prop must not be collected as a CSS var
  assert.equal(result.variables.every(v => !v.name.startsWith('--')), true);
  // but $prefix must still be in usages
  assert.equal(result.usages.has('$prefix'), true);
});

test.run();
