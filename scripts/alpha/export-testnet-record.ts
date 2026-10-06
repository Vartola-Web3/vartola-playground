import fs from 'fs';
import { prisma } from '../../lib/db';

// Exports public-safe references (contract IDs, transaction hashes, ledgers, event types) for the Technical page.
async function main() {
  const deployment = JSON.parse(fs.readFileSync('.alpha/deployment.json', 'utf8'));
  const facilities = await prisma.facility.findMany({ where: { facilityNo: { startsWith: 'FAC-FLEET' } }, orderBy: { facilityNo: 'asc' } });
  const out = [];
  for (const facility of facilities) {
    const events = await prisma.chainEvent.findMany({ where: { OR: [{ entityId: facility.id }, { entityId: { in: (await prisma.investment.findMany({ where: { allocations: { some: { facilityId: facility.id } } }, select: { id: true } })).map((row) => row.id) } }] }, orderBy: { createdAt: 'asc' } });
    out.push({
      facilityNo: facility.facilityNo,
      financeAmount: facility.financeAmount,
      term: facility.term,
      status: facility.status,
      chainStatus: facility.chainStatus,
      participationUnits: facility.participationUnits,
      events: events.map((e) => ({ eventType: e.eventType, txHash: e.txHash, ledger: e.ledger })),
    });
  }
  const record = { network: deployment.network, deployment, facilities: out, exportedAt: new Date().toISOString() };
  fs.writeFileSync('lib/docs/testnet-record.generated.json', JSON.stringify(record, null, 2));
  console.log(JSON.stringify(out.map((f) => ({ f: f.facilityNo, status: f.status, units: f.participationUnits, events: f.events.length })), null, 1));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
