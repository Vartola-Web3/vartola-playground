import assert from 'node:assert/strict';
import test from 'node:test';
import { assetHealth, healthSignal, verificationPanel, type AssetServicing } from './asset-health';
import { applyStageChange, canMove, suggestedStage } from './collections';
import { MIN_SAMPLE, SUPPLIER_ALLOWED, SUPPLIER_FORBIDDEN, resolveFailure, supplierMayDo, supplierScore } from '../supplier/performance';

const now = new Date('2026-10-06T00:00:00Z');
const asset = (overrides: Partial<AssetServicing> = {}): AssetServicing => ({
  stage: 'ACTIVE', registrationExpiry: '2027-06-01', insuranceExpiry: '2027-03-01', nextMaintenanceDue: '2027-01-01', lastMaintenanceAt: null, maintenanceCount: 1, downtimeDays: 0, usage: 12000,
  condition: 'GOOD', purchaseValue: 100_000, latestValuation: 95_000, valuationSource: 'ADMIN INPUT', ageYears: 1, usefulLifeYears: 8, accident: false, recoveryStatus: 'NONE', documentsComplete: 1, ...overrides,
});

test('a well-kept asset is HEALTHY and an expired, neglected one is AT RISK', () => {
  assert.equal(assetHealth(asset(), now).label, 'HEALTHY');
  const bad = assetHealth(asset({ insuranceExpiry: '2026-01-01', registrationExpiry: '2026-01-01', nextMaintenanceDue: '2026-02-01', condition: 'POOR', downtimeDays: 20, documentsComplete: 0.2 }), now);
  assert.equal(bad.label, 'AT RISK');
});

test('unknown expiry dates lower the score instead of being assumed fine', () => {
  assert.ok(assetHealth(asset({ insuranceExpiry: null }), now).score < assetHealth(asset(), now).score);
});

test('recovery caps health and the signal into the risk engine is bounded', () => {
  assert.ok(assetHealth(asset({ recoveryStatus: 'INITIATED' }), now).score <= 35);
  assert.ok(healthSignal(100) <= 10 && healthSignal(0) >= -10);
});

test('verification counts only checks that have a source', () => {
  const panel = verificationPanel([
    { name: 'VIN verified', verified: true, source: 'DOCUMENT' },
    { name: 'Invoice verified', verified: true, source: null },
    { name: 'Supplier verified', verified: false, source: 'MANUAL' },
  ]);
  assert.equal(panel.done, 1);
  assert.equal(panel.label, '1 / 6 VERIFIED');
});

test('collections cases move only along allowed stages and every move is checked', () => {
  assert.equal(canMove('LATE', 'DEFAULT_NOTICE'), true);
  assert.equal(canMove('LATE', 'CLOSED'), false);
  assert.equal(canMove('DEFAULT', 'CLOSED'), false);
  assert.equal(applyStageChange('DEFAULT', 'RECOVERY'), 'RECOVERY');
  assert.throws(() => applyStageChange('GRACE', 'RECOVERY'));
});

test('the suggested stage follows days past due using configurable parameters', () => {
  assert.equal(suggestedStage(0), 'PAYMENT_DUE');
  assert.equal(suggestedStage(3), 'GRACE');
  assert.equal(suggestedStage(10), 'LATE');
  assert.equal(suggestedStage(10, { reminderDays: 1, graceDays: 2, lateDays: 5, defaultNoticeDays: 60 }), 'RESTRUCTURING_REVIEW');
});

test('supplier score shows NOT ENOUGH DATA instead of inventing a history', () => {
  const none = supplierScore({ deliveries: 0, onTimeDeliveries: 0, priceVariancePct: [], documentIssues: 0, disputes: 0, conditionIssues: 0, warrantyClaims: 0 });
  assert.equal(none.status, 'NOT ENOUGH DATA');
  assert.equal(none.score, null);
  assert.equal(supplierScore({ deliveries: MIN_SAMPLE - 1, onTimeDeliveries: 2, priceVariancePct: [], documentIssues: 0, disputes: 0, conditionIssues: 0, warrantyClaims: 0 }).status, 'NOT ENOUGH DATA');
  const scored = supplierScore({ deliveries: 10, onTimeDeliveries: 9, priceVariancePct: [1, 2], documentIssues: 1, disputes: 0, conditionIssues: 0, warrantyClaims: 0 });
  assert.equal(scored.status, 'SCORED');
  assert.equal(scored.confidence, 'MEDIUM');
  assert.ok(scored.score !== null && scored.score > 80);
});

test('a supplier can never approve its own release or change terms', () => {
  for (const action of SUPPLIER_FORBIDDEN) assert.equal(supplierMayDo(action), false);
  for (const action of SUPPLIER_ALLOWED) assert.equal(supplierMayDo(action), true);
});

test('amending facility terms after a supplier failure needs explicit authorization', () => {
  assert.throws(() => resolveFailure('AMEND_FACILITY', null));
  assert.equal(resolveFailure('AMEND_FACILITY', 'admin-1').financialTermsChanged, true);
  assert.equal(resolveFailure('REFUND_ESCROW', null).financialTermsChanged, false);
});
