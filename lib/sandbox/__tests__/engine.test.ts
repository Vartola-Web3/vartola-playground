import assert from 'node:assert/strict';
import test from 'node:test';
import { applyAction, nextActions, type SandboxAction } from '../engine';
import { initialState, type SandboxState } from '../state';

function fundedActiveFacility(): SandboxState {
  let state = initialState('normal');
  state = applyAction(state, { type: 'SUBMIT_APPLICATION' });
  state = applyAction(state, { type: 'UNDERWRITE_APPROVE' });
  state = applyAction(state, { type: 'OPEN_POOL' });
  const investments = state.investors.map((row) => ({ id: row.id, amount: row.wallet.available }));
  for (const investment of investments) {
    state = applyAction(state, { type: 'INVEST', investorId: investment.id, amount: investment.amount });
  }
  for (const condition of state.conditions) {
    state = applyAction(state, { type: 'ATTEST_CONDITION', conditionType: condition.type });
  }
  state = applyAction(state, { type: 'RELEASE_TO_SUPPLIER' });
  for (const check of state.checks) {
    state = applyAction(state, { type: 'VERIFY_CHECK', checkType: check.type });
  }
  state = applyAction(state, { type: 'ACTIVATE_FACILITY' });
  return state;
}

test('a facility runs from application to completion', () => {
  let state = fundedActiveFacility();
  assert.equal(state.phase, 'ACTIVE');
  assert.equal(state.payments.length, state.facility.termMonths);

  for (let index = 0; index < state.facility.termMonths; index += 1) {
    state = applyAction(state, { type: 'PAY_INSTALLMENT' });
  }

  assert.equal(state.phase, 'COMPLETED');
  const principalReturned = state.investors.reduce((sum, row) => sum + row.principalReturned, 0);
  assert.equal(principalReturned, state.facility.financeAmount, 'the full principal returns to investors');
  const income = state.investors.reduce((sum, row) => sum + row.incomeReceived, 0);
  assert.ok(income > 0, 'investors receive lease income');
  assert.ok(state.reserveBalance > 0, 'the reserve accrues');
  assert.equal(state.sme.wallet.available, 0, 'the SME paid every installment from its wallet');
});

test('the engine is deterministic for the same seed and actions', () => {
  const script: SandboxAction[] = [
    { type: 'SUBMIT_APPLICATION' },
    { type: 'UNDERWRITE_APPROVE' },
    { type: 'OPEN_POOL' },
    { type: 'INVEST', investorId: 'investor-a', amount: 75_000 },
    { type: 'INVEST', investorId: 'investor-b', amount: 45_000 },
    { type: 'INVEST', investorId: 'investor-c', amount: 30_000 },
  ];
  const run = () => script.reduce((state, action) => applyAction(state, action), initialState('normal', 7));
  assert.deepEqual(run(), run());
});

test('early settlement closes the facility once', () => {
  let state = fundedActiveFacility();
  state = applyAction(state, { type: 'SETTLE_EARLY' });
  assert.equal(state.phase, 'SETTLED');
  assert.equal(state.flags.settled, true);
  assert.throws(() => applyAction(state, { type: 'SETTLE_EARLY' }));
});

test('default and recovery distribute principal first and never exceed the proceeds', () => {
  let state = fundedActiveFacility();
  state = applyAction(state, { type: 'PAY_INSTALLMENT' });
  state = applyAction(state, { type: 'MARK_DEFAULT' });
  assert.equal(state.phase, 'DEFAULTED');

  state = applyAction(state, { type: 'RECOVER', proceeds: 90_000 });
  assert.equal(state.phase, 'RECOVERED');
  const recovered = state.investors.reduce((sum, row) => sum + row.recoveryReceived, 0);
  assert.ok(recovered > 0 && recovered <= 90_000, 'recovery is distributed and bounded by the proceeds');
  assert.equal(state.recovery.length, state.investors.length);
});

test('an action is rejected outside its phase', () => {
  const fresh = initialState('normal');
  assert.throws(() => applyAction(fresh, { type: 'PAY_INSTALLMENT' }), /not available at phase/);
  assert.throws(() => applyAction(fresh, { type: 'RELEASE_TO_SUPPLIER' }), /not available at phase/);
});

test('available actions follow the active role and phase', () => {
  const fresh = initialState('normal');
  assert.deepEqual(nextActions(fresh).map((row) => row.id), ['SUBMIT_APPLICATION']);

  const asInvestor = applyAction(
    applyAction(applyAction(fresh, { type: 'SUBMIT_APPLICATION' }), { type: 'UNDERWRITE_APPROVE' }),
    { type: 'OPEN_POOL' },
  );
  assert.deepEqual(nextActions({ ...asInvestor, actor: 'INVESTOR' }).map((row) => row.id), ['INVEST']);
});
