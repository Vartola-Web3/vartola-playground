import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FACILITY_RISK_MODEL_V1,
  FACILITY_RISK_MODEL_VERSION,
  FACILITY_RISK_WEIGHTS,
  FACILITY_RISK_WEIGHTS_V1,
  computeFacilityRisk,
  concentrationScore,
  contributionScore,
  financeToValueScore,
  paymentCapacityScore,
  scoreDrivers,
  servicingScore,
  snapshotHash,
  type FacilityRiskInput,
} from './facility-score';

const base: FacilityRiskInput = {
  businessScore: 80, assetScore: 70, dealScore: 75,
  servicing: { status: 'ACTIVE', paidOnTime: 3, paidLate: 0, missed: 0, scheduled: 24 },
};

const profile = { assetValue: 180000, smeContribution: 30000, financeAmount: 150000, monthlyPayment: 7000, monthlyNetCashFlow: 40000, concentrationPct: 12, liquidityScore: null };

test('weights add up to one in both model versions', () => {
  for (const weights of [FACILITY_RISK_WEIGHTS, FACILITY_RISK_WEIGHTS_V1]) {
    assert.ok(Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  }
});

test('the same inputs always give the same score, grade and snapshot hash', () => {
  const a = computeFacilityRisk(base, new Date('2026-10-05T00:00:00Z'));
  const b = computeFacilityRisk(JSON.parse(JSON.stringify(base)), new Date('2027-01-01T00:00:00Z'));
  assert.equal(a.score, b.score);
  assert.equal(a.grade, b.grade);
  assert.equal(a.inputSnapshotHash, b.inputSnapshotHash);
  assert.equal(a.modelVersion, FACILITY_RISK_MODEL_V1);
  assert.match(a.inputSnapshotHash, /^[a-f0-9]{64}$/);
});

test('a different input changes the snapshot hash', () => {
  assert.notEqual(snapshotHash(base), snapshotHash({ ...base, dealScore: 76 }));
});

test('late and missed payments lower the score, distress caps servicing', () => {
  const clean = computeFacilityRisk(base).score;
  const late = computeFacilityRisk({ ...base, servicing: { ...base.servicing, paidLate: 2, missed: 1 } }).score;
  assert.ok(late < clean);
  assert.equal(servicingScore({ ...base.servicing, status: 'DEFAULTED' }) <= 25, true);
});

test('grade follows the existing tier thresholds', () => {
  assert.equal(computeFacilityRisk({ ...base, businessScore: 95, assetScore: 95, dealScore: 95 }).grade, 'A');
  assert.equal(computeFacilityRisk({ ...base, businessScore: 20, assetScore: 20, dealScore: 20, servicing: { ...base.servicing, status: 'DEFAULTED' } }).grade, 'D');
});

test('v2 is used when a profile is present and records the version', () => {
  const result = computeFacilityRisk({ ...base, profile });
  assert.equal(result.modelVersion, FACILITY_RISK_MODEL_VERSION);
  assert.equal(Object.keys(result.components).length, 9);
  assert.equal(result.explanation.length, 9);
  assert.notEqual(result.inputSnapshotHash, computeFacilityRisk(base).inputSnapshotHash);
});

test('v2 is deterministic and sensitive to each new input', () => {
  const first = computeFacilityRisk({ ...base, profile }, new Date('2026-10-06T00:00:00Z'));
  const again = computeFacilityRisk({ ...base, profile: { ...profile } }, new Date('2027-02-01T00:00:00Z'));
  assert.equal(first.score, again.score);
  assert.equal(first.inputSnapshotHash, again.inputSnapshotHash);
  const worse = [
    { ...profile, smeContribution: 0 },
    { ...profile, financeAmount: 180000 },
    { ...profile, concentrationPct: 60 },
    { ...profile, monthlyNetCashFlow: 8000 },
  ];
  for (const changed of worse) assert.ok(computeFacilityRisk({ ...base, profile: changed }).score < first.score);
});

test('component scoring rules', () => {
  assert.equal(contributionScore(100, 0), 20);
  assert.equal(contributionScore(100, 40), 100);
  assert.equal(financeToValueScore(100, 60), 100);
  assert.equal(financeToValueScore(100, 100), 20);
  assert.equal(paymentCapacityScore(30, 100), 100);
  assert.equal(paymentCapacityScore(100, 100), 10);
  assert.equal(paymentCapacityScore(10, null), 50);
  assert.equal(paymentCapacityScore(10, -5), 10);
  assert.equal(concentrationScore(10), 100);
  assert.equal(concentrationScore(50), 20);
});

test('drivers say what improves the score and what holds it down', () => {
  const weak = computeFacilityRisk({ ...base, profile: { ...profile, smeContribution: 0, concentrationPct: 60 } });
  const drivers = scoreDrivers(weak);
  assert.ok(drivers.improves.length > 0);
  assert.ok(drivers.increases.some((text) => /SME contribution/.test(text)));
  assert.ok(drivers.increases.some((text) => /portfolio/.test(text)));
});
