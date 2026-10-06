import { createHash } from 'crypto';
import { scValToNative } from '@stellar/stellar-sdk';
import { prisma } from '@/lib/db';
import { sorobanServer } from '@/lib/stellar/soroban/call';
import { facilityContractId, registryContractId } from '@/lib/stellar/keys';
import { mirrorChainEvent } from '@/lib/alpha/journal';
import { addDeadLetter, getIndexerState, setIndexerState } from '@/lib/alpha/ops-state';

// Cursor-based, idempotent Soroban event indexer.
// Soroban events -> ChainEvent (read model, unique per tx + type + entity) -> Firebase journal.
// Re-reading the same events never creates duplicates, and a failed event is retried and then dead-lettered
// without blocking the cursor for the events after it.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRY_DELAYS_MS = [300, 1200];

function topicText(value: unknown) {
  try {
    const native = scValToNative(value as never);
    return typeof native === 'string' ? native : String(native);
  } catch {
    return '';
  }
}

export type RawEvent = { id: string; txHash: string; ledger: number; contractId?: { toString(): string } | string; topic?: unknown[] };

export function normalizeEvent(event: RawEvent) {
  const eventType = (event.topic?.[0] ? topicText(event.topic[0]) : '') || 'SorobanEvent';
  const entityId = (event.topic?.[1] ? topicText(event.topic[1]) : '') || event.id;
  return {
    eventType: eventType.slice(0, 80),
    entityId,
    entityType: /^Asset|^Insurance|^Registration/.test(eventType) ? 'Asset' : 'Facility',
    txHash: event.txHash,
    ledger: event.ledger,
    contractId: event.contractId ? String(typeof event.contractId === 'string' ? event.contractId : event.contractId.toString()) : '',
    payloadHash: createHash('sha256').update(`${event.id}:${event.txHash}:${eventType}:${entityId}`).digest('hex'),
  };
}

async function storeWithRetry(event: ReturnType<typeof normalizeEvent>, eventId: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await mirrorChainEvent({
        eventType: event.eventType,
        txHash: event.txHash,
        ledger: event.ledger,
        contractId: event.contractId,
        entityType: event.entityType,
        entityId: event.entityId,
        payload: { eventId, payloadHash: event.payloadHash },
      });
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  await addDeadLetter({ at: new Date().toISOString(), stage: 'store', ref: eventId, error: lastError instanceof Error ? lastError.message.slice(0, 300) : 'unknown error' });
  return false;
}

export async function indexSorobanEvents() {
  const contracts = [facilityContractId(), registryContractId()].filter(Boolean);
  if (contracts.length === 0) throw new Error('Contract IDs are not configured');
  const state = await getIndexerState();
  const startedAt = new Date().toISOString();
  try {
    const server = sorobanServer();
    const cursor = await prisma.systemSettings.findUnique({ where: { key: 'SOROBAN_EVENT_CURSOR' } });
    const latest = await server.getLatestLedger();
    const filters = contracts.map((contractId) => ({ contractIds: [contractId], type: 'contract' as const }));
    const request = cursor?.value
      ? { filters, cursor: cursor.value, limit: 100 }
      : { filters, startLedger: Math.max(1, latest.sequence - 5000), limit: 100 };
    const page = await server.getEvents(request);
    let stored = 0;
    let failed = 0;
    let lastType = state.latestEventType;
    let lastLedger = state.lastIndexedLedger;
    for (const raw of page.events || []) {
      const event = normalizeEvent(raw as unknown as RawEvent);
      if (await storeWithRetry(event, raw.id)) {
        stored += 1;
        lastType = event.eventType;
        lastLedger = Math.max(lastLedger, event.ledger);
      } else {
        failed += 1;
      }
    }
    // The cursor moves forward even when an event is dead-lettered, so one bad event cannot stall the indexer.
    if (page.cursor) {
      await prisma.systemSettings.upsert({
        where: { key: 'SOROBAN_EVENT_CURSOR' },
        create: { key: 'SOROBAN_EVENT_CURSOR', value: page.cursor, category: 'blockchain' },
        update: { value: page.cursor },
      });
    }
    await setIndexerState({
      ...state,
      lastIndexedLedger: lastLedger,
      latestEventAt: stored > 0 ? new Date().toISOString() : state.latestEventAt,
      latestEventType: lastType,
      lastRunAt: startedAt,
      lastSuccessAt: failed === 0 ? new Date().toISOString() : state.lastSuccessAt,
      consecutiveFailures: failed === 0 ? 0 : state.consecutiveFailures + 1,
      pendingRetries: failed,
      lastError: failed ? `${failed} event(s) were dead-lettered` : null,
      totalIndexed: state.totalIndexed + stored,
    });
    return { stored, failed, latestLedger: latest.sequence };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : 'indexer failed';
    await addDeadLetter({ at: new Date().toISOString(), stage: 'fetch', error: message });
    await setIndexerState({ ...state, lastRunAt: startedAt, consecutiveFailures: state.consecutiveFailures + 1, pendingRetries: state.pendingRetries + 1, lastError: message });
    throw error;
  }
}
