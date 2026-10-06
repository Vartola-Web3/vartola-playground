import assert from 'node:assert/strict';
import test from 'node:test';
import { gradeFromPoints, summarizeAdmin, summarizeInvestor } from './analytics';
import type { Position } from './positions';

function position(overrides: Partial<Position>): Position {
  return {
    facilityId: 'f', facilityNo: 'F', investorWallet: null, participationUnits: 100, committedAmount: 10000, deployedAmount: 10000,
    principalReturned: 0, incomeReceived: 0, recoveryReceived: 0, outstandingExposure: 10000, status: 'ACTIVE', facilityStatus: 'ACTIVE', transferable: false,
    ...overrides,
  };
}

test('investor totals add up across facilities', () => {
  const stats = summarizeInvestor([
    position({ facilityId: 'a', principalReturned: 1000, incomeReceived: 200, outstandingExposure: 9000 }),
    position({ facilityId: 'b', committedAmount: 5000, deployedAmount: 5000, outstandingExposure: 5000, facilityStatus: 'LATE' }),
  ], { a: 'A', b: 'C' });
  assert.equal(stats.totalDeployed, 15000);
  assert.equal(stats.outstandingPrincipal, 14000);
  assert.equal(stats.principalReturned, 1000);
  assert.equal(stats.incomeReceived, 200);
  assert.equal(stats.activeFacilities, 1);
  assert.equal(stats.lateFacilities, 1);
  assert.match(stats.note, /no monetary value/);
});

test('default exposure counts only facilities in a default stage', () => {
  const stats = summarizeInvestor([
    position({ facilityId: 'a', facilityStatus: 'DEFAULTED', outstandingExposure: 4000 }),
    position({ facilityId: 'b', facilityStatus: 'ACTIVE', outstandingExposure: 6000 }),
  ], {});
  assert.equal(stats.defaultExposure, 4000);
  assert.equal(stats.weightedRiskGrade, null);
});

test('the weighted grade follows the committed amounts', () => {
  const stats = summarizeInvestor([
    position({ facilityId: 'a', committedAmount: 90000 }),
    position({ facilityId: 'b', committedAmount: 10000 }),
  ], { a: 'A', b: 'D' });
  assert.equal(stats.weightedRiskGrade, 'A');
  assert.equal(gradeFromPoints(2.5), 'B');
  assert.equal(gradeFromPoints(1.2), 'D');
});

test('admin analytics: funding, repayment, exposure and recovery rates', () => {
  const stats = summarizeAdmin([
    { status: 'ACTIVE', financeAmount: 1000, fundedAmount: 1000, principalReturned: 200, recoveryReceived: 0, scheduledDue: 300, paid: 300 },
    { status: 'LATE', financeAmount: 1000, fundedAmount: 1000, principalReturned: 0, recoveryReceived: 0, scheduledDue: 200, paid: 100 },
    { status: 'CLOSED', financeAmount: 1000, fundedAmount: 1000, principalReturned: 0, recoveryReceived: 600, scheduledDue: 0, paid: 0 },
    { status: 'FUNDING', financeAmount: 1000, fundedAmount: 400, principalReturned: 0, recoveryReceived: 0, scheduledDue: 0, paid: 0 },
  ]);
  assert.equal(stats.totalFacilities, 4);
  assert.equal(stats.fundingRate, 0.85);
  assert.equal(stats.repaymentRate, 0.8);
  assert.equal(stats.lateExposure, 1000);
  // Closed facilities and facilities still funding have no outstanding principal.
  assert.equal(stats.outstandingPrincipal, 800 + 1000);
  assert.equal(stats.recoveryRate, 0.6);
});
