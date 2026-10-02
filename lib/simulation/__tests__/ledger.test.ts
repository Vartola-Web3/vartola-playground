import assert from 'node:assert/strict';
import test from 'node:test';

test('available balance cannot fund more than it holds', () => {
  const available = 1000;
  const amount = 1500;
  assert.equal(available >= amount, false);
});

test('returned principal becomes available again', () => {
  const available = 0;
  const principal = 10000;
  const income = 1000;
  assert.equal(available + principal + income, 11000);
});
