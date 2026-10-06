import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPTY_INDEXER, indexerHealth, reconciliationCode } from './ops-state';

const now = Date.parse('2026-10-06T12:00:00Z');
const ok = { ...EMPTY_INDEXER, lastRunAt: '2026-10-06T11:55:00Z', lastSuccessAt: '2026-10-06T11:55:00Z' };

test('reconciliation codes follow the status', () => {
  assert.equal(reconciliationCode('HEALTHY'), 'RECONCILIATION_OK');
  assert.equal(reconciliationCode('WARNING'), 'RECONCILIATION_WARNING');
  assert.equal(reconciliationCode('FAILED'), 'RECONCILIATION_FAILED');
});

test('indexer health: not started, healthy, degraded, down', () => {
  assert.equal(indexerHealth(EMPTY_INDEXER, now), 'NOT_STARTED');
  assert.equal(indexerHealth(ok, now), 'HEALTHY');
  assert.equal(indexerHealth({ ...ok, consecutiveFailures: 1 }, now), 'DEGRADED');
  assert.equal(indexerHealth({ ...ok, consecutiveFailures: 3 }, now), 'DOWN');
});

test('an indexer that has not succeeded for an hour is degraded', () => {
  assert.equal(indexerHealth({ ...ok, lastSuccessAt: '2026-10-06T09:00:00Z' }, now), 'DEGRADED');
});
