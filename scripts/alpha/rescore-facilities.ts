import { prisma } from '../../lib/db';
import { attestFacilityRisk } from '../../lib/alpha/chain';

// Re-scores every chain-confirmed facility with the current risk model and anchors the new result on-chain.
// The earlier attestation stays visible in the event history, so the change is traceable.
async function main() {
  const actor = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  const facilities = await prisma.facility.findMany({ where: { chainStatus: 'CHAIN_CONFIRMED' }, orderBy: { createdAt: 'asc' } });
  for (const facility of facilities) {
    const result = await attestFacilityRisk(facility.id, actor?.id || 'system');
    console.log(facility.facilityNo, 'attested', result.hash.slice(0, 16), 'ledger', result.ledger);
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); }).finally(() => prisma.$disconnect());
