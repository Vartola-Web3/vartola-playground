import assert from 'node:assert/strict';
import test from 'node:test';
import { hashReceipt, makeReceipt, explorerTx } from './receipts';

const base = {
  type: 'REPAYMENT' as const,
  facilityId: 'f1',
  facilityNo: 'FAC-1',
  operationType: 'record_repayment',
  wallet: null,
  amount: 700,
  timestamp: '2026-10-06T00:00:00.000Z',
  transactionHash: 'a'.repeat(64),
  ledger: 5042123,
  contractId: 'CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM',
};

test('a receipt hash is deterministic and covers every financial field', () => {
  const receipt = makeReceipt(base);
  assert.match(receipt.receiptHash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receiptHash, makeReceipt({ ...base }).receiptHash);
  for (const change of [{ amount: 701 }, { transactionHash: 'b'.repeat(64) }, { ledger: 1 }, { facilityId: 'f2' }, { type: 'DISTRIBUTION' as const }]) {
    assert.notEqual(makeReceipt({ ...base, ...change }).receiptHash, receipt.receiptHash);
  }
});

test('the hash is recomputable from the public receipt fields', () => {
  const receipt = makeReceipt(base);
  assert.equal(hashReceipt({ ...base, asset: 'VTAED' }), receipt.receiptHash);
});

test('a receipt links to Stellar Explorer and carries no private fields', () => {
  const receipt = makeReceipt(base);
  assert.equal(receipt.explorerUrl, explorerTx(base.transactionHash));
  assert.match(receipt.explorerUrl, /^https:\/\/stellar\.expert\/explorer\/testnet\/tx\/[a-f0-9]{64}$/);
  assert.equal(receipt.asset, 'VTAED');
  const keys = Object.keys(receipt).sort();
  assert.deepEqual(keys, ['amount', 'asset', 'contractId', 'explorerUrl', 'facilityId', 'facilityNo', 'ledger', 'operationType', 'receiptHash', 'timestamp', 'title', 'transactionHash', 'type', 'wallet']);
});
