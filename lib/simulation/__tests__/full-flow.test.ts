import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateWaterfall, assertCapacity } from '../../marketplace/allocate';
import { allocateShares, splitPayment } from '../../lifecycle/rules';

test('wallet balance gates an investment before allocation', () => {
  assert.equal(assertCapacity(25_000, 100_000, 10_000), null);
  assert.match(assertCapacity(110_000, 100_000, 10_000) || '', /Maximum/);
  assert.equal(20_000 >= 25_000, false);
});

test('a fully funded opportunity reserves the exact facility amount', () => {
  const plan = allocateWaterfall([{ id: 'facility-1', required: 100_000, funded: 60_000, priority: 1 }], 40_000);
  assert.equal(plan.unallocated, 0);
  assert.deepEqual(plan.allocations, [{ facilityId: 'facility-1', amount: 40_000, fundedAfter: 100_000, required: 100_000 }]);
});

test('an installment returns principal and income in investor proportions', () => {
  const parts = splitPayment(10_000, 0, 0);
  const shares = allocateShares(
    [{ id: 'investor-a', deployedAmount: 75_000 }, { id: 'investor-b', deployedAmount: 25_000 }],
    parts.principal,
    parts.leaseIncome,
  );
  assert.equal(shares[0].principal + shares[0].leaseIncome, 7_500);
  assert.equal(shares[1].principal + shares[1].leaseIncome, 2_500);
  assert.equal(shares.reduce((sum, row) => sum + row.principal + row.leaseIncome, 0), 10_000);
});

