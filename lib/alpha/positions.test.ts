import assert from 'node:assert/strict';
import test from 'node:test';
import { exposure, positionStatus } from './positions';

const none = { settledEarly: false, deployed: 0, principalReturned: 0, recoveryReceived: 0 };

test('a position moves from reserved to funded to active', () => {
  assert.equal(positionStatus({ ...none, facilityStatus: 'FUNDING' }), 'RESERVED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'FUNDED' }), 'FUNDED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'ASSET_DELIVERY_PENDING' }), 'FUNDED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'ACTIVE', deployed: 100 }), 'ACTIVE');
});

test('a position becomes partially repaid after principal comes back', () => {
  assert.equal(positionStatus({ ...none, facilityStatus: 'ACTIVE', deployed: 100, principalReturned: 10 }), 'PARTIALLY_REPAID');
});

test('closed positions are settled, recovered or closed', () => {
  assert.equal(positionStatus({ ...none, facilityStatus: 'COMPLETED', settledEarly: true }), 'SETTLED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'CLOSED', recoveryReceived: 50 }), 'RECOVERED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'CLOSED' }), 'CLOSED');
  assert.equal(positionStatus({ ...none, facilityStatus: 'COMPLETED' }), 'CLOSED');
});

test('exposure is committed capital less what came back, never negative, and zero once closed', () => {
  assert.equal(exposure({ committed: 1000, principalReturned: 250, recoveryReceived: 0, closed: false }), 750);
  assert.equal(exposure({ committed: 1000, principalReturned: 900, recoveryReceived: 200, closed: false }), 0);
  assert.equal(exposure({ committed: 1000, principalReturned: 0, recoveryReceived: 0, closed: true }), 0);
});
