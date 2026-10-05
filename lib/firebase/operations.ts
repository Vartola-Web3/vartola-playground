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
  try {
    await db.collection('operations').doc(input.id).set({
      title: input.title,
      kind: input.kind,
      status: input.status,
      testnetAddress: input.testnetAddress || null,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      network: input.testnetAddress ? 'stellar-testnet' : null,
      projectId: 'assetfi-uae',
      databaseId: process.env.FIRESTORE_DATABASE_ID || 'vartola-ops',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Firebase operation write failed:', error);
    return false;
  }
}

export async function firebaseOperationIds(ids: string[]) {
  const db = firebaseDb();
  if (!db || ids.length === 0) return new Set<string>();
  try {
    const snaps = await db.getAll(...ids.map((id) => db.collection('operations').doc(id)));
    return new Set(snaps.filter((snap) => snap.exists).map((snap) => snap.id));
  } catch (error) {
    console.error('Firebase operation read failed:', error);
    return new Set<string>();
  }
}
