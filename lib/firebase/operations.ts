import { createHash } from 'crypto';
import { firebaseDb } from '@/lib/firebase/admin';

const TITLES: Record<string, string> = {
  SYNC_SNAPSHOT: 'Testnet snapshot',
  CREATE_FACILITY: 'Asset recorded',
  RECORD_PAYMENT: 'Installment paid',
  DISTRIBUTE_PAYMENT: 'Profit distribution',
  SUBSCRIBE_POOL: 'Investment',
  CREATE_WALLET: 'Wallet created',
  FUND_WALLET: 'Wallet top-up',
  RELEASE_FUNDS: 'Funds released',
  APPLICATION_SUBMITTED: 'Application submitted',
  DOCUMENT_STORED: 'Document stored',
};

export function operationTitle(kind: string) {
  return TITLES[kind] || kind.replaceAll('_', ' ');
}

const RETRY_DELAYS_MS = [250, 1000, 3000];

// The journal is append-only: every event gets its own document id, built from the entity id plus the
// transaction hash (or a hash of the event itself). Writing an existing id is treated as already saved and
// never overwrites an earlier event. Failures are retried with backoff and never throw into the financial path.
export function operationEventId(input: { id: string; kind: string; status: string; title?: string; testnetAddress?: string | null }) {
  const key = input.testnetAddress
    ? input.testnetAddress.slice(0, 16)
    : createHash('sha256').update([input.kind, input.status, input.title || ''].join('|')).digest('hex').slice(0, 12);
  return `${input.id}__${key}`;
}

export async function rememberOperation(input: {
  id: string;
  title: string;
  kind: string;
  status: string;
  testnetAddress?: string | null;
  entityType?: string;
  entityId?: string;
}) {
  const db = firebaseDb();
  if (!db) return false;
  const docId = operationEventId(input);
  const data = {
    title: input.title,
    kind: input.kind,
    status: input.status,
    testnetAddress: input.testnetAddress || null,
    entityType: input.entityType || null,
    entityId: input.entityId || null,
    entityKey: input.id,
    network: input.testnetAddress ? 'stellar-testnet' : null,
    projectId: 'assetfi-uae',
    databaseId: process.env.FIRESTORE_DATABASE_ID || 'vartola-ops',
    createdAt: new Date().toISOString(),
  };
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await db.collection('operations').doc(docId).create(data);
      return true;
    } catch (error) {
      const code = (error as { code?: number | string }).code;
      if (code === 6 || code === 'already-exists') return true;
      if (attempt === RETRY_DELAYS_MS.length) {
        console.error('Firebase operation write failed after retries:', error);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
  return false;
}

// Returns the entity keys that have at least one journal event.
export async function firebaseOperationIds(ids: string[]) {
  const db = firebaseDb();
  if (!db || ids.length === 0) return new Set<string>();
  try {
    const found = new Set<string>();
    await Promise.all(ids.map(async (id) => {
      const snap = await db.collection('operations').where('entityKey', '==', id).limit(1).get();
      if (!snap.empty) found.add(id);
    }));
    return found;
  } catch (error) {
    console.error('Firebase operation read failed:', error);
    return new Set<string>();
  }
}
