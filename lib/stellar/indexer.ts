import { prisma } from '@/lib/db';
import { sorobanServer } from '@/lib/stellar/soroban/call';
import { facilityContractId, registryContractId } from '@/lib/stellar/keys';
import { mirrorChainEvent } from '@/lib/alpha/journal';

export async function indexSorobanEvents() {
  const contracts = [facilityContractId(), registryContractId()].filter(Boolean);
  if (contracts.length === 0) throw new Error('Contract IDs are not configured');
  const server = sorobanServer();
  const cursor = await prisma.systemSettings.findUnique({ where: { key: 'SOROBAN_EVENT_CURSOR' } });
  const latest = await server.getLatestLedger();
  const request = cursor?.value
    ? { filters: contracts.map((contractId) => ({ contractIds: [contractId], type: 'contract' as const })), cursor: cursor.value, limit: 100 }
    : { filters: contracts.map((contractId) => ({ contractIds: [contractId], type: 'contract' as const })), startLedger: Math.max(1, latest.sequence - 500), limit: 100 };
  const page = await server.getEvents(request);
  let stored = 0;
  for (const event of page.events || []) {
    const eventType = event.topic?.[0]?.toString?.() || 'SorobanEvent';
    const entityId = event.id;
    await mirrorChainEvent({
      eventType: eventType.slice(0, 80),
      txHash: event.txHash,
      ledger: event.ledger,
      contractId: event.contractId?.toString?.() || '',
      entityType: 'SorobanEvent',
      entityId,
      payload: { id: event.id },
    });
    stored += 1;
  }
  if (page.cursor) {
    await prisma.systemSettings.upsert({
      where: { key: 'SOROBAN_EVENT_CURSOR' },
      create: { key: 'SOROBAN_EVENT_CURSOR', value: page.cursor, category: 'blockchain' },
      update: { value: page.cursor },
    });
  }
  return { stored, latestLedger: latest.sequence };
}
