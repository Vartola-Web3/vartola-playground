import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateShares, isReady, splitPayment } from '../rules';

test('release stays blocked until required checks pass', () => {
  assert.equal(isReady(100, 100, [{ isRequired: true, status: 'PENDING' }]), false);
  assert.equal(isReady(100, 100, [{ isRequired: true, status: 'VERIFIED' }]), true);
  assert.equal(isReady(90, 100, [{ isRequired: true, status: 'VERIFIED' }]), false);
});

test('payment split keeps components separate', () => {
  const parts = splitPayment(12000, 0.02, 0.01);
  assert.equal(parts.serviceFee, 240);
  assert.equal(parts.reserve, 120);
  assert.equal(parts.principal + parts.leaseIncome, parts.net);
});

test('only deployed facility shares receive the repayment', () => {
  const shares = allocateShares(
    [
      { id: 'a', deployedAmount: 60000 },
      { id: 'b', deployedAmount: 0 },
      { id: 'c', deployedAmount: 60000 },
    ],
    7000,
    3000
  );
  assert.equal(shares.length, 3);
  assert.equal(shares[1].principal, 0);
  assert.equal(shares[0].principal, 3500);
});
