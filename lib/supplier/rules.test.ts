import assert from 'node:assert/strict';
import test from 'node:test';
import { hashSerial, releaseStatusLabel, validateSubmission } from './rules';

test('an invoice needs a reference, a positive amount and a file', () => {
  assert.equal(validateSubmission({ kind: 'INVOICE', reference: 'INV-1', amount: 1000, hasFile: true }).ok, true);
  assert.equal(validateSubmission({ kind: 'INVOICE', reference: '', amount: 1000, hasFile: true }).ok, false);
  assert.equal(validateSubmission({ kind: 'INVOICE', reference: 'INV-1', amount: -5, hasFile: true }).ok, false);
  assert.equal(validateSubmission({ kind: 'INVOICE', reference: 'INV-1', amount: 1000, hasFile: false }).ok, false);
});

test('asset details store a hash of the serial, never the serial', () => {
  const result = validateSubmission({ kind: 'ASSET_DETAILS', serial: 'vin-abc123' });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.serialHash, hashSerial('VIN-ABC123'));
    assert.equal(JSON.stringify(result.value).includes('abc123'), false);
  }
  assert.equal(validateSubmission({ kind: 'ASSET_DETAILS', serial: 'ab' }).ok, false);
});

test('unknown submission types are refused, so a supplier cannot approve a release', () => {
  for (const kind of ['APPROVE_RELEASE', 'RELEASE', 'SET_TERMS', 'COMPLIANCE_OVERRIDE']) {
    assert.equal(validateSubmission({ kind }).ok, false);
  }
});

test('delivery evidence needs a file; confirmation does not', () => {
  assert.equal(validateSubmission({ kind: 'DELIVERY_EVIDENCE' }).ok, false);
  assert.equal(validateSubmission({ kind: 'DELIVERY_CONFIRMATION' }).ok, true);
});

test('release status wording follows operations', () => {
  assert.match(releaseStatusLabel('FUNDED', false), /Waiting for release checks/);
  assert.match(releaseStatusLabel('ASSET_DELIVERY_PENDING', true), /released/);
});
