import assert from 'node:assert/strict';
import test from 'node:test';
import { BUDGET, GRANT_TOTAL, TRANCHES } from './product';

test('proposed SCF budget totals 150,000', () => {
  const lines = BUDGET.reduce((sum, row) => sum + row.amount, 0);
  const tranches = TRANCHES.reduce((sum, row) => sum + row.amount, 0);
  assert.equal(lines, GRANT_TOTAL);
  assert.equal(tranches, GRANT_TOTAL);
  assert.equal(GRANT_TOTAL, 150_000);
});
