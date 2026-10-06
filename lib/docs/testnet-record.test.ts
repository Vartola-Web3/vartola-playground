import assert from 'node:assert/strict';
import test from 'node:test';
import { TESTNET } from './testnet';

const contract = /^C[A-Z2-7]{55}$/;
const account = /^G[A-Z2-7]{55}$/;
const hash = /^[a-f0-9]{64}$/;

test('recorded contract IDs and accounts have the Stellar format', () => {
  assert.match(TESTNET.deployment.registryContractId, contract);
  assert.match(TESTNET.deployment.facilityContractId, contract);
  assert.match(TESTNET.deployment.asset.contractId, contract);
  assert.match(TESTNET.deployment.admin, account);
  assert.match(TESTNET.deployment.pauser, account);
  assert.notEqual(TESTNET.deployment.admin, TESTNET.deployment.pauser);
  assert.equal(TESTNET.network, 'Stellar Testnet');
});

test('every privileged role has its own wallet, distinct from the administrator', () => {
  const roles = TESTNET.deployment.roles || {};
  assert.deepEqual(Object.keys(roles).sort(), ['compliance', 'operations', 'underwriter']);
  const wallets = [TESTNET.deployment.admin, TESTNET.deployment.pauser, TESTNET.deployment.treasury, ...Object.values(roles)];
  assert.equal(new Set(wallets).size, wallets.length);
  for (const wallet of wallets) assert.match(wallet, account);
});

test('every deployment and facility reference is a transaction hash with a ledger', () => {
  for (const tx of Object.values(TESTNET.deployment.transactions)) {
    assert.match(tx.hash, hash);
    assert.ok(tx.ledger > 0);
  }
  for (const facility of TESTNET.facilities) {
    for (const event of facility.events) {
      assert.match(event.txHash, hash);
      assert.ok(event.ledger > 0, `${facility.facilityNo} ${event.eventType} has no ledger`);
    }
  }
});

test('Facility #001 is 150,000 VTAED in 1,500 units of 100', () => {
  const facility = TESTNET.facilities.find((row) => row.facilityNo === 'FAC-FLEET-001');
  assert.ok(facility);
  assert.equal(facility.financeAmount, 150000);
  assert.equal(facility.participationUnits, 1500);
  assert.equal(facility.financeAmount / 100, facility.participationUnits);
});

test('no secret key appears in the public record', () => {
  assert.equal(/S[A-Z2-7]{55}/.test(JSON.stringify(TESTNET)), false);
});
