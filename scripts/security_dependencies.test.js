// Regression coverage for local patches required until upstream fixes are available.
const assert = require('node:assert/strict');
const test = require('node:test');
const braces = require('braces');

const depthError = error =>
  error instanceof RangeError &&
  error.message === 'Brace nesting exceeds maximum depth';

function deepAst() {
  const root = { type: 'root', nodes: [] };
  let parent = root;
  for (let i = 0; i < 2000; i++) {
    const child = { type: 'brace', nodes: [], parent };
    parent.nodes.push(child);
    parent = child;
  }
  parent.nodes.push({ type: 'text', value: 'x' });
  return root;
}

test('CVE-2026-93687: reject deep patterns before recursive AST processing', () => {
  const patterns = [
    '{'.repeat(2000) + 'x' + '}'.repeat(2000),
    '('.repeat(2000) + 'x' + ')'.repeat(2000),
    '{'.repeat(2000) + 'x'
  ];
  for (const pattern of patterns) {
    for (const method of [
      'parse',
      'compile',
      'expand',
      'stringify',
      'create'
    ]) {
      assert.throws(() => braces[method](pattern), depthError, method);
    }
    assert.throws(() => braces(pattern), depthError);
    assert.throws(() => braces(pattern, { expand: true }), depthError);
  }
});

test('CVE-2026-93687: guard callers supplying ASTs directly', () => {
  for (const method of ['compile', 'expand', 'stringify']) {
    assert.throws(() => braces[method](deepAst()), depthError, method);
  }
});

test('brace matching and expansion retain normal behavior', () => {
  assert.deepEqual(braces.expand('src/{main,assets}/{a,b}.js'), [
    'src/main/a.js',
    'src/main/b.js',
    'src/assets/a.js',
    'src/assets/b.js'
  ]);
  assert.deepEqual(braces.expand('file-{1..3}.txt'), [
    'file-1.txt',
    'file-2.txt',
    'file-3.txt'
  ]);
  assert.equal(braces.compile('file-{a,b}.txt'), 'file-(a|b).txt');
  assert.equal(
    braces.stringify(braces.parse('file-{a,b}.txt')),
    'file-{a,b}.txt'
  );
  let nested = ['first', undefined, 'last'];
  for (let i = 0; i < 20000; i++) nested = [nested];
  assert.deepEqual(require('braces/lib/utils').flatten(nested), [
    'first',
    'last'
  ]);
});
