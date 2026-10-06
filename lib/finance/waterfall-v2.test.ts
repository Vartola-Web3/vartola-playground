import assert from 'node:assert/strict';
import test from 'node:test';
import { NO_RESERVE, distributeByUnits, splitRecovery, splitRepayment, splitSettlement } from './waterfall-v2';
import { buildScenarios } from './scenarios';

const reserve = { reserveRateBps: 50, reserveTarget: 1_000, permittedUses: ['SHORTFALL' as const] };
const repay = (overrides = {}) => splitRepayment({ gross: 7_000, feeBps: 100, reserve, reserveBalance: 0, financeAmount: 150_000, termMonths: 24, paymentIndex: 1, remainingPrincipal: 150_000, ...overrides });

test('a repayment splits into fee, reserve, principal and income that add up to the gross', () => {
  const split = repay();
  assert.equal(split.fee + split.reserve + split.principal + split.income, 7_000);
  assert.equal(split.principal, 6_250);
  assert.equal(split.fee, 70);
  assert.equal(split.reserve, 35);
});

test('invariant: parts never exceed gross and principal never exceeds what remains', () => {
  for (const gross of [0, 1, 99, 5_000, 7_000, 1_000_000]) {
    for (const remaining of [0, 10, 6_250, 150_000]) {
      const split = repay({ gross, remainingPrincipal: remaining });
      assert.ok(split.fee + split.reserve + split.principal + split.income <= gross);
      assert.ok(split.principal <= remaining);
      assert.ok([split.fee, split.reserve, split.principal, split.income].every((value) => value >= 0));
    }
  }
});

test('the reserve stops accruing at its target and is zero without a policy', () => {
  assert.equal(repay({ reserveBalance: 1_000 }).reserve, 0);
  assert.equal(repay({ reserveBalance: 990 }).reserve, 10);
  assert.equal(repay({ reserve: NO_RESERVE }).reserve, 0);
});

test('the final payment takes the remaining principal', () => {
  const split = repay({ paymentIndex: 24, remainingPrincipal: 3_000 });
  assert.equal(split.principal, 3_000);
});

test('settlement closes principal plus income plus fee less rebate and cannot go negative', () => {
  const split = splitSettlement(100_000, 900, 1_000, 300);
  assert.equal(split.due, 101_600);
  assert.equal(split.income, 600);
  assert.equal(splitSettlement(0, 0, 0, 5).income, 0);
});

test('invariant: recovery never distributes more than realised proceeds plus an allowed reserve', () => {
  for (const proceeds of [0, 10_000, 90_000, 200_000]) {
    for (const allowReserve of [false, true]) {
      const split = splitRecovery({ grossProceeds: proceeds, servicingCost: 1_000, recoveryCost: 4_000, principalOutstanding: 100_000, accruedIncome: 500, reserveBalance: 2_000, reserveMayCoverShortfall: allowReserve });
      assert.ok(split.investorDistribution <= proceeds - split.costs + split.reserveApplied);
      assert.ok(split.reserveApplied <= (allowReserve ? 2_000 : 0));
      assert.equal(split.costs + split.investorDistribution + split.residual - split.reserveApplied, proceeds);
    }
  }
});

test('recovery pays costs, then principal, then income, then residual', () => {
  const split = splitRecovery({ grossProceeds: 120_000, servicingCost: 1_000, recoveryCost: 4_000, principalOutstanding: 100_000, accruedIncome: 500, reserveBalance: 0, reserveMayCoverShortfall: false });
  assert.equal(split.costs, 5_000);
  assert.equal(split.principal, 100_000);
  assert.equal(split.income, 500);
  assert.equal(split.residual, 14_500);
  assert.equal(split.shortfall, 0);
});

test('distribution by units is deterministic and never over-distributes', () => {
  const holders = [{ id: 'a', units: 750 }, { id: 'b', units: 450 }, { id: 'c', units: 300 }];
  const result = distributeByUnits(6_895, holders);
  assert.ok(result.distributed <= 6_895);
  assert.equal(result.distributed + result.dust, 6_895);
  assert.deepEqual(distributeByUnits(6_895, holders), result);
  assert.equal(distributeByUnits(100, []).distributed, 0);
});

test('sandbox scenarios run the same engine and carry all four states', () => {
  const scenarios = buildScenarios();
  assert.equal(scenarios.length, 6);
  for (const scenario of scenarios) {
    assert.ok(scenario.steps.length > 2);
    assert.ok(scenario.asset && scenario.chain && scenario.operational);
    assert.ok(Object.keys(scenario.financial).length > 0);
  }
  assert.ok(scenarios.find((scenario) => scenario.key === 'default')?.steps.some((step) => /applicable law/.test(step)));
});
