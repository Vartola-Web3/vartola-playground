import { prisma } from '@/lib/db';
import { rememberOperation } from '@/lib/firebase/operations';

export async function mirrorChainEvent(input: {
  eventType: string;
  txHash: string;
  ledger?: number;
  contractId?: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
  title?: string;
}) {
  await prisma.chainEvent.upsert({
    where: {
      txHash_eventType_entityId: {
        txHash: input.txHash,
        eventType: input.eventType,
        entityId: input.entityId,
      },
    },
    create: {
      eventType: input.eventType,
      txHash: input.txHash,
      ledger: input.ledger || 0,
      contractId: input.contractId || '',
      entityType: input.entityType,
      entityId: input.entityId,
      payload: JSON.stringify(input.payload || {}),
    },
    update: {},
  });
  try {
    await rememberOperation({
      id: `${input.eventType}_${input.entityId}_${input.txHash.slice(0, 16)}`,
      title: input.title || input.eventType,
      kind: input.eventType,
      status: 'CHAIN_CONFIRMED',
      testnetAddress: input.txHash,
      entityType: input.entityType,
      entityId: input.entityId,
    });
  } catch (error) {
    console.error('Firebase mirror failed:', error);
  }
}
