import { prisma } from '@/lib/db';

// Small operational state (indexer cursor health, last reconciliation, dead letters) kept in SystemSettings.
// It is monitoring data only. It is never a source of financial truth.

export type IndexerState = {
  lastIndexedLedger: number;
  latestEventAt: string | null;
  latestEventType: string | null;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
  pendingRetries: number;
  lastError: string | null;
  totalIndexed: number;
};

export type DeadLetter = { at: string; stage: string; error: string; ref?: string };

export type ReconciliationRecord = {
  code: 'RECONCILIATION_OK' | 'RECONCILIATION_WARNING' | 'RECONCILIATION_FAILED';
  status: 'HEALTHY' | 'WARNING' | 'FAILED';
  checkedAt: string;
  facilities: number;
  findings: number;
  trigger: 'SCHEDULED' | 'MANUAL';
};

export const EMPTY_INDEXER: IndexerState = {
  lastIndexedLedger: 0, latestEventAt: null, latestEventType: null, lastRunAt: null, lastSuccessAt: null,
  consecutiveFailures: 0, pendingRetries: 0, lastError: null, totalIndexed: 0,
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.systemSettings.findUnique({ where: { key } });
    return row?.value ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key: string, value: unknown) {
  const text = JSON.stringify(value);
  await prisma.systemSettings.upsert({ where: { key }, create: { key, value: text, category: 'ops' }, update: { value: text } });
}

export const getIndexerState = () => read<IndexerState>('ops.indexer.state', EMPTY_INDEXER);
export const setIndexerState = (state: IndexerState) => write('ops.indexer.state', state);
export const getDeadLetters = () => read<DeadLetter[]>('ops.dead_letters', []);
export async function addDeadLetter(entry: DeadLetter) {
  const list = await getDeadLetters();
  await write('ops.dead_letters', [entry, ...list].slice(0, 50));
}
export const clearDeadLetters = () => write('ops.dead_letters', []);
export const getLastReconciliation = () => read<ReconciliationRecord | null>('ops.reconciliation.last', null);
export const setLastReconciliation = (record: ReconciliationRecord) => write('ops.reconciliation.last', record);

export function reconciliationCode(status: 'HEALTHY' | 'WARNING' | 'FAILED'): ReconciliationRecord['code'] {
  return status === 'HEALTHY' ? 'RECONCILIATION_OK' : status === 'WARNING' ? 'RECONCILIATION_WARNING' : 'RECONCILIATION_FAILED';
}

// Health summary used by the admin transparency panel.
export function indexerHealth(state: IndexerState, now = Date.now(), staleAfterMs = 60 * 60 * 1000): 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'NOT_STARTED' {
  if (!state.lastRunAt) return 'NOT_STARTED';
  if (state.consecutiveFailures >= 3) return 'DOWN';
  const last = state.lastSuccessAt ? Date.parse(state.lastSuccessAt) : 0;
  if (state.consecutiveFailures > 0 || now - last > staleAfterMs) return 'DEGRADED';
  return 'HEALTHY';
}
