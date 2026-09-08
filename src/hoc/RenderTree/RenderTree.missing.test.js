const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

test('missing widget keys render DefaultErrorComponent instead of null', () => {
  assert.match(src, /DefaultErrorComponent/);
  assert.match(src, /Component not found for "/);
  const missingBranch = src.slice(
    src.indexOf('if (key && !rows)'),
    src.indexOf('} catch (error)'),
  );
  assert.match(missingBranch, /DefaultErrorComponent/);
  assert.doesNotMatch(missingBranch, /return null/);
});
