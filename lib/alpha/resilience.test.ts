import assert from 'node:assert/strict';
import test from 'node:test';
import { compareFacility, summarize } from './reconcile';
import { dedupeEvents, finalityFor, journalSafely, makeReplayGuard, orderEvents, withRetry } from './resilience';

const ev = (txHash: string, eventType: string, ledger: number, id = '') => ({ txHash, eventType, entityId: 'fac-1', ledger, id });

test('a duplicate Soroban event is stored once', () => {
  const events = [ev('a', 'RepaymentRecorded', 10), ev('a', 'RepaymentRecorded', 10), ev('b', 'RepaymentRecorded', 11)];
  assert.equal(dedupeEvents(events).length, 2);
  assert.equal(dedupeEvents(events, new Set(['a|RepaymentRecorded|fac-1'])).length, 1);
});

test('out-of-order events are processed by ledger', () => {
  const ordered = orderEvents([ev('c', 'X', 30), ev('a', 'X', 10), ev('b', 'X', 20)]);
  assert.deepEqual(ordered.map((row) => row.ledger), [10, 20, 30]);
});

test('finality is never fabricated when the chain did not confirm', () => {
  assert.equal(finalityFor({ status: 'SUCCESS', hash: 'h', ledger: 5 }), 'CHAIN_CONFIRMED');
  assert.equal(finalityFor({ status: 'TIMEOUT', hash: 'h', ledger: 5 }), 'CHAIN_PENDING');
  assert.equal(finalityFor({ status: 'RPC_UNAVAILABLE' }), 'CHAIN_PENDING');
  assert.equal(finalityFor({ status: 'SUCCESS' }), 'CHAIN_PENDING');
  assert.equal(finalityFor({ status: 'SUCCESS', hash: 'h', ledger: 0 }), 'CHAIN_PENDING');
  assert.equal(finalityFor({ status: 'FAILED', hash: 'h', ledger: 5 }), 'CHAIN_FAILED');
});

test('an RPC or provider outage retries, then dead-letters instead of throwing', async () => {
  let calls = 0;
  const result = await withRetry(async () => { calls += 1; throw new Error('rpc down'); }, 3);
  assert.equal(result.ok, false);
  assert.equal(calls, 3);
  if (!result.ok) assert.equal(result.deadLetter, true);
  let flaky = 0;
  const recovered = await withRetry(async () => { flaky += 1; if (flaky < 2) throw new Error('timeout'); return 'ok'; }, 3);
  assert.equal(recovered.ok, true);
});

test('a replayed webhook is processed once', () => {
  const accept = makeReplayGuard();
  assert.equal(accept('d1'), true);
  assert.equal(accept('d1'), false);
});

test('a Firebase outage never blocks the confirmed event', async () => {
  const failures: string[] = [];
  const ok = await journalSafely(async () => { throw new Error('firebase unavailable'); }, (message) => failures.push(message));
  assert.equal(ok, false);
  assert.deepEqual(failures, ['firebase unavailable']);
});

test('a reconciliation mismatch is reported, not hidden', () => {
  const unit = BigInt(10_000_000);
  const findings = compareFacility(
    { status: 6, fundedStroops: BigInt(3000) * unit, issuedUnits: BigInt(30), principalOutstandingStroops: BigInt(2500) * unit, positions: {} },
    { id: 'f', facilityNo: 'F', status: 'ACTIVE', financeAmount: 3000, fundedAmount: 2000, participationUnits: 30, principalReturned: 500, allocations: [] },
  );
  assert.notEqual(summarize(findings), 'HEALTHY');
});
