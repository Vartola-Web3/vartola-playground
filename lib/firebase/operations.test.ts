import assert from 'node:assert/strict';
import test from 'node:test';
import { operationEventId } from './operations';

test('different events on the same entity get different journal ids', () => {
  const first = operationEventId({ id: 'Facility_1', kind: 'FundsReleased', status: 'CHAIN_CONFIRMED', testnetAddress: 'a'.repeat(64) });
  const second = operationEventId({ id: 'Facility_1', kind: 'RepaymentRecorded', status: 'CHAIN_CONFIRMED', testnetAddress: 'b'.repeat(64) });
  assert.notEqual(first, second);
  assert.ok(first.startsWith('Facility_1__'));
});

test('the same event always maps to the same id, so a retry cannot duplicate it', () => {
  const input = { id: 'Application_9', kind: 'APPLICATION_SUBMITTED', status: 'SUBMITTED', title: 'Application submitted' };
  assert.equal(operationEventId(input), operationEventId({ ...input }));
});

test('events without a hash still differ by kind and status', () => {
  const a = operationEventId({ id: 'Application_9', kind: 'APPLICATION_SUBMITTED', status: 'SUBMITTED' });
  const b = operationEventId({ id: 'Application_9', kind: 'APPLICATION_APPROVED', status: 'APPROVED' });
  assert.notEqual(a, b);
});
