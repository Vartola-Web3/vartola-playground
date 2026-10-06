// Fail-safe primitives for event processing and chain finality. Pure and injectable so each behaviour can be tested
// without a network. Rule: financial finality is only ever recorded when the chain confirmed it.

export type ChainOutcome = { hash?: string | null; ledger?: number | null; status?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'TIMEOUT' | 'RPC_UNAVAILABLE' };
export type Finality = 'CHAIN_CONFIRMED' | 'CHAIN_PENDING' | 'CHAIN_FAILED';

export function finalityFor(outcome: ChainOutcome): Finality {
  if (outcome.status === 'FAILED') return 'CHAIN_FAILED';
  if (outcome.status === 'SUCCESS' && outcome.hash && outcome.ledger && outcome.ledger > 0) return 'CHAIN_CONFIRMED';
  // Missing hash, no ledger, a timeout or an RPC outage: never claim finality.
  return 'CHAIN_PENDING';
}

export type IndexedEvent = { txHash: string; eventType: string; entityId: string; ledger: number; id?: string };

const keyOf = (event: IndexedEvent) => `${event.txHash}|${event.eventType}|${event.entityId}`;

// Duplicate delivery of the same Soroban event produces one record.
export function dedupeEvents(events: IndexedEvent[], alreadyStored: Set<string> = new Set()) {
  const seen = new Set(alreadyStored);
  const fresh: IndexedEvent[] = [];
  for (const event of events) {
    const key = keyOf(event);
    if (seen.has(key)) continue;
    seen.add(key);
    fresh.push(event);
  }
  return fresh;
}

// Events can arrive out of order; processing order is by ledger then event id, so projection is deterministic.
export function orderEvents(events: IndexedEvent[]) {
  return [...events].sort((a, b) => a.ledger - b.ledger || String(a.id || '').localeCompare(String(b.id || '')));
}

export async function withRetry<T>(work: () => Promise<T>, attempts: number, sleep: (ms: number) => Promise<void> = async () => undefined) {
  let last: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return { ok: true as const, value: await work(), attempts: attempt };
    } catch (error) {
      last = error;
      if (attempt < attempts) await sleep(2 ** attempt * 100);
    }
  }
  return { ok: false as const, error: last instanceof Error ? last.message : String(last), attempts, deadLetter: true as const };
}

// A webhook delivered twice is processed once.
export function makeReplayGuard() {
  const seen = new Set<string>();
  return (deliveryId: string) => {
    if (seen.has(deliveryId)) return false;
    seen.add(deliveryId);
    return true;
  };
}

// The journal (Firebase) is best effort: a failure there must never block or reverse a confirmed financial event.
export async function journalSafely(write: () => Promise<void>, onFailure: (message: string) => void) {
  try {
    await write();
    return true;
  } catch (error) {
    onFailure(error instanceof Error ? error.message : String(error));
    return false;
  }
}
