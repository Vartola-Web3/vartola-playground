import assert from 'node:assert/strict';
import test from 'node:test';
import { compareFacility, summarize, type ChainFacility, type DbFacility } from './reconcile';

const unit = BigInt(10_000_000);
const wallet = 'GINVESTORWALLETAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function chain(overrides: Partial<ChainFacility> = {}): ChainFacility {
  return { status: 6, fundedStroops: BigInt(3000) * unit, issuedUnits: BigInt(30), principalOutstandingStroops: BigInt(2500) * unit, positions: { [wallet]: BigInt(30) }, ...overrides };
}
function db(overrides: Partial<DbFacility> = {}): DbFacility {
  return { id: 'f1', facilityNo: 'FAC-1', status: 'ACTIVE', financeAmount: 3000, fundedAmount: 3000, participationUnits: 30, principalReturned: 500, allocations: [{ investorWallet: wallet, units: 30 }], ...overrides };
}

test('matching chain and database state is healthy', () => {
  const findings = compareFacility(chain(), db());
  assert.deepEqual(findings, []);
  assert.equal(summarize(findings), 'HEALTHY');
});

test('a wrong facility state is an error', () => {
  const findings = compareFacility(chain({ status: 7 }), db());
  assert.equal(findings[0].code, 'STATUS_MISMATCH');
  assert.equal(summarize(findings), 'FAILED');
});

test('an amount mismatch is detected', () => {
  const codes = compareFacility(chain({ fundedStroops: BigInt(2999) * unit }), db()).map((row) => row.code);
  assert.ok(codes.includes('FUNDED_AMOUNT_MISMATCH'));
});

test('a stale unit count and an incorrect distribution are detected', () => {
  const stale = compareFacility(chain({ issuedUnits: BigInt(20) }), db()).map((row) => row.code);
  assert.ok(stale.includes('UNIT_MISMATCH'));
  const principal = compareFacility(chain({ principalOutstandingStroops: BigInt(2000) * unit }), db()).map((row) => row.code);
  assert.ok(principal.includes('PRINCIPAL_MISMATCH'));
});

test('a missing or wrong investment position is detected', () => {
  assert.ok(compareFacility(chain({ positions: {} }), db()).some((row) => row.code === 'MISSING_POSITION'));
  assert.ok(compareFacility(chain({ positions: { [wallet]: BigInt(10) } }), db()).some((row) => row.code === 'POSITION_MISMATCH'));
});

test('an investor with no wallet is only a warning', () => {
  const findings = compareFacility(chain(), db({ allocations: [{ investorWallet: null, units: 30 }] }));
  assert.equal(summarize(findings), 'WARNING');
});

test('a closed facility ignores outstanding principal drift after settlement', () => {
  const findings = compareFacility(chain({ status: 11, principalOutstandingStroops: BigInt(0) }), db({ status: 'COMPLETED' }));
  assert.deepEqual(findings, []);
});
