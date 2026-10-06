import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_ASSUMPTIONS, computeExpectedLoss, lossGivenDefault, portfolioExpectedLoss } from './expected-loss';
import { computeFacilityRisk } from './facility-score';
import { explainRisk, suggestedActions } from './explain';
import { SCENARIOS, concentrationBy, runScenario, topExposures, upcomingBreaches, type Exposure } from './portfolio';

const base = { grade: 'B' as const, outstandingPrincipal: 100_000, assetValue: 150_000, financeAmount: 120_000, liquidity: 'high' as const };

test('expected loss is PD x LGD x EAD', () => {
  const result = computeExpectedLoss(base, DEFAULT_ASSUMPTIONS, new Date('2026-10-06T00:00:00Z'));
  assert.equal(result.pd, 0.03);
  assert.equal(result.ead, 100_000);
  assert.equal(result.expectedLoss, Math.round(result.pd * result.lgd * result.ead * 100) / 100);
  assert.match(result.inputSnapshotHash, /^[a-f0-9]{64}$/);
  assert.equal(result.modelVersion, 'vartola-el-v1');
  assert.match(result.notice, /not a regulated credit rating/i);
});

test('the same inputs always give the same snapshot hash and result', () => {
  const when = new Date('2026-10-06T00:00:00Z');
  assert.deepEqual(computeExpectedLoss(base, DEFAULT_ASSUMPTIONS, when), computeExpectedLoss(base, DEFAULT_ASSUMPTIONS, when));
  assert.notEqual(computeExpectedLoss(base).inputSnapshotHash, computeExpectedLoss({ ...base, outstandingPrincipal: 99_000 }).inputSnapshotHash);
});

test('a worse grade or a distressed status raises PD; a safer asset lowers LGD', () => {
  assert.ok(computeExpectedLoss({ ...base, grade: 'D' }).pd > computeExpectedLoss({ ...base, grade: 'A' }).pd);
  assert.equal(computeExpectedLoss({ ...base, grade: 'A', status: 'DEFAULTED' }).pd, DEFAULT_ASSUMPTIONS.distressedPdFloor);
  assert.ok(lossGivenDefault({ ...base, assetValue: 300_000 }) < lossGivenDefault({ ...base, assetValue: 90_000 }));
  assert.equal(lossGivenDefault({ ...base, outstandingPrincipal: 0 }), 0);
});

test('a reserve reduces loss only when the facility terms allow it', () => {
  const stressed = { ...base, assetValue: 60_000, reserveBalance: 5_000 };
  assert.ok(lossGivenDefault({ ...stressed, applyReserve: true }) < lossGivenDefault({ ...stressed, applyReserve: false }));
});

test('assumptions are configurable', () => {
  const tough = { ...DEFAULT_ASSUMPTIONS, recoveryRateByLiquidity: { high: 0.3, medium: 0.2, low: 0.1 } };
  assert.ok(computeExpectedLoss(base, tough).expectedLoss > computeExpectedLoss(base).expectedLoss);
});

test('portfolio expected loss is the sum of facility losses', () => {
  const a = computeExpectedLoss(base);
  const b = computeExpectedLoss({ ...base, grade: 'C' });
  const total = portfolioExpectedLoss([a, b]);
  assert.equal(total.expectedLoss, Math.round((a.expectedLoss + b.expectedLoss) * 100) / 100);
  assert.equal(portfolioExpectedLoss([]).lossRate, 0);
});

const risk = computeFacilityRisk({ businessScore: 85, assetScore: 90, dealScore: 40, servicing: { status: 'ACTIVE', paidOnTime: 3, paidLate: 0, missed: 0, scheduled: 24 }, profile: { assetValue: 150_000, smeContribution: 60_000, financeAmount: 90_000, monthlyPayment: 4_000, monthlyNetCashFlow: 5_000, concentrationPct: 60, liquidityScore: 90 } });

test('risk explanation lists positives, negatives, risks and mitigants from the components', () => {
  const view = explainRisk(risk);
  assert.ok(view.positives.length > 0);
  assert.ok(view.negatives.length > 0);
  assert.ok(view.keyRisks.some((text) => /concentration|payment|structure/i.test(text)));
  assert.ok(view.mitigants.includes('High SME contribution'));
  assert.ok(suggestedActions(risk).length > 0);
});

const row = (id: string, sme: string, outstanding: number, extra: Partial<Exposure> = {}): Exposure => ({ facilityId: id, facilityNo: id, sme, supplier: 'S1', assetClass: 'Truck', sector: 'Logistics', geography: 'Dubai', grade: 'B', outstanding, assetValue: outstanding * 1.4, status: 'ACTIVE', pd: 0.03, lgd: 0.2, ...extra });

test('concentration flags groups above their limit and finds top exposures', () => {
  const rows = [row('A', 'Big', 800), row('B', 'Small', 100), row('C', 'Small2', 100)];
  const sme = concentrationBy(rows, 'sme');
  assert.equal(sme[0].key, 'Big');
  assert.equal(sme[0].breach, true);
  assert.equal(topExposures(rows, 1)[0].facilityId, 'A');
  assert.ok(upcomingBreaches(rows).length > 0);
});

test('stress scenarios increase loss and are labelled as analysis, not a forecast', () => {
  const rows = [row('A', 'X', 1000), row('B', 'Y', 500, { grade: 'C', pd: 0.08 })];
  const base0 = runScenario(rows, SCENARIOS[0]);
  const combined = runScenario(rows, SCENARIOS[SCENARIOS.length - 1]);
  assert.ok(combined.expectedLoss > base0.expectedLoss);
  assert.match(base0.note, /NOT A FORECAST/);
  const supplierHit = runScenario(rows, { ...SCENARIOS[0], supplierFailure: 'S1' });
  assert.ok(supplierHit.expectedLoss >= base0.expectedLoss);
});
