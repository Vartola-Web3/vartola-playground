import assert from 'node:assert/strict';
import test from 'node:test';
import { ACTIONS, MATRIX, MFA_REQUIRED, MULTISIG_POLICIES, PRIVILEGED_ROLES, approvalSatisfied, canApp, multisigStatus, separationViolations } from './roles';
import { REQUIREMENTS, mainnetAvailable, summarize } from './readiness';
import { pilotKpis, pipelineCounts, validateEntry, STAGES, type PilotEntry } from './pilots';
import { facilityLifecycle, stageOf } from '../docs/proof';
import { TESTNET } from '../docs/testnet';
import { NECESSITY } from '../docs/necessity';

test('every action has at least one role, every role is known, and duties are separated', () => {
  for (const action of ACTIONS) {
    assert.ok(MATRIX[action].length > 0, action);
    for (const role of MATRIX[action]) assert.ok(PRIVILEGED_ROLES.includes(role));
  }
  assert.deepEqual(separationViolations(), []);
  assert.equal(MATRIX.authorize_release.includes('TREASURY'), false);
  assert.equal(MATRIX.pay_supplier.includes('CONTRACT_ADMIN'), false);
});

test('the read-only auditor can look but cannot change anything financial', () => {
  for (const action of ACTIONS) {
    if (!['view_dashboards', 'run_reconciliation', 'export_reports'].includes(action)) assert.equal(MATRIX[action].includes('AUDITOR_READ_ONLY'), false, action);
  }
});

test('application roles map onto least-privilege actions', () => {
  assert.equal(canApp('ADMIN', 'manage_pilots'), true);
  assert.equal(canApp('ADMIN_REVIEWER', 'manage_collections'), true);
  assert.equal(canApp('ADMIN_REVIEWER', 'upgrade_contract'), false);
  assert.equal(canApp('INVESTOR', 'view_dashboards'), false);
  assert.equal(canApp(undefined, 'view_dashboards'), false);
});

test('MFA is required for the sensitive roles', () => {
  for (const role of ['PLATFORM_OWNER', 'CONTRACT_ADMIN', 'TREASURY', 'OPERATIONS'] as const) assert.ok(MFA_REQUIRED.includes(role));
});

test('multisig is described as ready but not enforced until it is', () => {
  assert.equal(multisigStatus(), 'READY, NOT ENFORCED');
  const policy = MULTISIG_POLICIES[0];
  assert.equal(approvalSatisfied(policy, ['a', 'b']), false);
  assert.equal(approvalSatisfied(policy, ['a', 'a', 'a']), false);
  assert.equal(approvalSatisfied(policy, ['a', 'b', 'c']), true);
});

test('Mainnet stays unavailable while any required gate is incomplete', () => {
  assert.equal(mainnetAvailable(), false);
  const summary = summarize();
  assert.ok(summary.complete < summary.total);
  assert.equal(mainnetAvailable(REQUIREMENTS.map((item) => ({ ...item, status: 'COMPLETE' as const }))), true);
  assert.ok(REQUIREMENTS.find((item) => /audit/i.test(item.requirement))?.status !== 'COMPLETE');
});

const entry = (overrides: Partial<PilotEntry>): PilotEntry => ({ id: 'x', name: 'n', type: 'SME', stage: 'IDENTIFIED', prospectiveVolume: 0, assetsRequested: 0, onboarded: false, pilotFacility: false, notes: '', ...overrides });

test('an empty pilot pipeline shows zero, never fake traction', () => {
  const kpi = pilotKpis([]);
  assert.deepEqual(Object.values(kpi), Array(Object.keys(kpi).length).fill(0));
  assert.ok(pipelineCounts([]).every((row) => row.count === 0));
  assert.equal(pipelineCounts([]).length, STAGES.length);
});

test('pilot KPIs count only what was entered', () => {
  const kpi = pilotKpis([
    entry({ stage: 'LOI_SIGNED', prospectiveVolume: 100_000, assetsRequested: 5 }),
    entry({ stage: 'INTERESTED' }),
    entry({ stage: 'CONTACTED' }),
    entry({ stage: 'DECLINED', prospectiveVolume: 999_999 }),
    entry({ type: 'SUPPLIER', onboarded: true, stage: 'PILOT_READY' }),
    entry({ type: 'INSURANCE_PARTNER', stage: 'MEETING' }),
  ]);
  assert.equal(kpi.smesContacted, 3);
  assert.equal(kpi.smesInterested, 2);
  assert.equal(kpi.lois, 2);
  assert.equal(kpi.prospectiveVolume, 100_000);
  assert.equal(kpi.suppliersOnboarded, 1);
  assert.equal(kpi.partnerDiscussions, 1);
  assert.throws(() => validateEntry({ name: '', type: 'SME', stage: 'IDENTIFIED' }));
  assert.throws(() => validateEntry({ name: 'x', type: 'BANK' as never, stage: 'IDENTIFIED' }));
});

test('every recorded Testnet event maps to a lifecycle stage and carries a real hash', () => {
  for (const facility of TESTNET.facilities) {
    const view = facilityLifecycle(facility.facilityNo);
    assert.ok(view);
    assert.deepEqual(view.unclassified, [], `${facility.facilityNo} has unclassified events`);
    for (const stage of view.stages) for (const event of stage.events) assert.match(event.txHash, /^[a-f0-9]{64}$/);
  }
  assert.equal(stageOf('RecoveryRecorded'), 'SETTLEMENT_RECOVERY');
  assert.equal(facilityLifecycle('FAC-DOES-NOT-EXIST'), null);
});

test('the proof lifecycle shows recovery only for the default facility', () => {
  const reached = (no: string) => facilityLifecycle(no)?.stages.find((stage) => stage.key === 'SETTLEMENT_RECOVERY')?.events.map((event) => event.eventType) || [];
  assert.ok(reached('FAC-FLEET-003').includes('RecoveryRecorded'));
  assert.ok(!reached('FAC-FLEET-001').includes('RecoveryRecorded'));
});

test('the on-chain necessity matrix covers every function the brief names and is not boastful', () => {
  const names = NECESSITY.map((row) => row.fn);
  for (const required of ['Investor authorization', 'Facility state', 'Participation position', 'Escrow', 'Capital release', 'Repayment', 'Distribution', 'Settlement', 'Recovery', 'Attestation', 'Reconciliation']) assert.ok(names.includes(required), required);
  assert.equal(/solves all|guarantee/i.test(JSON.stringify(NECESSITY)), false);
});
