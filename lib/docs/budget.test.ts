import assert from 'node:assert/strict';
import test from 'node:test';
import { GRANT_ASK, GRANT_MILESTONES } from './product';

test('public grant content states the ask without line-item amounts', () => {
  assert.match(GRANT_ASK, /150,000/);
  assert.ok(GRANT_MILESTONES.length > 0);
  assert.equal(/\$\s?\d/.test(JSON.stringify(GRANT_MILESTONES)), false);
});
