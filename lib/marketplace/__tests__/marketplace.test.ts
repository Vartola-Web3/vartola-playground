import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateWaterfall, assertCapacity } from '../allocate';
import { poolRiskScore } from '../risk';

test('waterfall fills the smallest priority first', () => {
  const result = allocateWaterfall(
    [
      { id: 'a', required: 120000, funded: 0, priority: 1 },
      { id: 'b', required: 180000, funded: 0, priority: 2 },
      { id: 'c', required: 250000, funded: 0, priority: 3 },
    ],
    200000
  );
  assert.equal(result.allocations[0].amount, 120000);
  assert.equal(result.allocations[1].amount, 80000);
  assert.equal(result.allocations.length, 2);
  assert.equal(result.unallocated, 0);
});

test('rejects amounts above remaining capacity', () => {
  assert.match(assertCapacity(20000, 12000, 1000) || '', /12,?000|12000/);
});

test('pool risk is weighted, not a plain average', () => {
  const rated = poolRiskScore({
    companyQuality: 70,
    assetQuality: 80,
    diversification: 60,
    smeContribution: 50,
    concentrationRisk: 40,
  });
  assert.equal(rated.score, 68);
  assert.equal(rated.rating, 'B-');
});
