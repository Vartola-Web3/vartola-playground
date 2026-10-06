import assert from 'node:assert/strict';
import test from 'node:test';
import { xdr } from '@stellar/stellar-sdk';
import { normalizeEvent, type RawEvent } from './indexer';

const event = (name: string, id: string, overrides: Partial<RawEvent> = {}): RawEvent => ({
  id: '0000000000-0000000001',
  txHash: 'c'.repeat(64),
  ledger: 5045400,
  contractId: 'CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM',
  topic: [xdr.ScVal.scvSymbol(name), xdr.ScVal.scvString(id)],
  ...overrides,
});

test('a contract event is normalized to type, entity, ledger and a payload hash', () => {
  const normalized = normalizeEvent(event('EscrowFullyFunded', 'fac-1'));
  assert.equal(normalized.eventType, 'EscrowFullyFunded');
  assert.equal(normalized.entityId, 'fac-1');
  assert.equal(normalized.entityType, 'Facility');
  assert.equal(normalized.ledger, 5045400);
  assert.match(normalized.payloadHash, /^[a-f0-9]{64}$/);
});

test('the same event always normalizes identically, so re-indexing creates no duplicates', () => {
  assert.deepEqual(normalizeEvent(event('RepaymentRecorded', 'fac-1')), normalizeEvent(event('RepaymentRecorded', 'fac-1')));
  assert.notEqual(normalizeEvent(event('RepaymentRecorded', 'fac-1')).payloadHash, normalizeEvent(event('RepaymentRecorded', 'fac-2')).payloadHash);
});

test('asset events belong to the asset, and unreadable topics do not crash the indexer', () => {
  assert.equal(normalizeEvent(event('AssetDelivered', 'asset-1')).entityType, 'Asset');
  const odd = normalizeEvent(event('X', 'y', { topic: [] }));
  assert.equal(odd.eventType, 'SorobanEvent');
  assert.equal(odd.entityId, '0000000000-0000000001');
});
