import { prisma } from '../../lib/db';
import { adminAnalytics, investorAnalytics } from '../../lib/alpha/analytics';
import { certificateFor, positionsForInvestor } from '../../lib/alpha/positions';
import { receiptsForFacility } from '../../lib/alpha/receipts';
import { runReconciliation } from '../../lib/alpha/reconcile-runner';
import { facilityProof } from '../../lib/alpha/verify';
import { getLastReconciliation } from '../../lib/alpha/ops-state';

// Exercises the read side against the real Testnet facilities in the local Alpha database.
async function main() {
  const facility = await prisma.facility.findFirstOrThrow({ where: { facilityNo: 'FAC-FLEET-001' }, include: { allocations: true } });
  const investorId = facility.allocations[0].investorId;

  const receipts = await receiptsForFacility(facility.id);
  const byType: Record<string, number> = {};
  for (const receipt of receipts) byType[receipt.type] = (byType[receipt.type] || 0) + 1;
  console.log('receipts', JSON.stringify(byType), 'all have ledger:', receipts.every((row) => row.ledger > 0));

  const positions = await positionsForInvestor(investorId);
  console.log('positions', JSON.stringify(positions.map((row) => ({ f: row.facilityNo, units: row.participationUnits, status: row.status, exposure: row.outstandingExposure, principal: row.principalReturned, income: row.incomeReceived }))));
  const certificate = await certificateFor(investorId, facility.id);
  console.log('certificate chain references', certificate?.chainReferences.length, 'notice ok:', /not a security certificate/.test(certificate?.notice || ''));
  console.log('investor analytics', JSON.stringify(await investorAnalytics(investorId)));
  console.log('admin analytics', JSON.stringify(await adminAnalytics()));

  const proof = await facilityProof('FAC-FLEET-001');
  console.log('public proof', JSON.stringify({ state: proof?.lifecycleState, read: proof?.chainRead, funding: proof?.fundingPercent, units: proof?.totalUnits, outstanding: proof?.principalOutstanding, docAtt: proof?.documentAttestations, assetAtt: proof?.assetAttestations, risk: proof?.risk?.grade, events: proof?.events.length }));
  const leaked = JSON.stringify(proof);
  console.log('proof leaks private fields:', /GBQ|@vartola\.test|fleet001|password|secret/i.test(leaked));

  const run = await runReconciliation('MANUAL');
  console.log('reconciliation', run.status, run.findings.length, JSON.stringify(await getLastReconciliation()));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); }).finally(() => prisma.$disconnect());
