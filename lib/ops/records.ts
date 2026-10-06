import { prisma } from '@/lib/db';

// Operational records with an audit trail. Every create or update writes an audit log entry with the previous and
// new state. Secrets and personal identifiers must not be stored in the payload.

export const KINDS = ['PILOT', 'COLLECTION_CASE', 'SERVICING_EVENT', 'INSURANCE_CLAIM', 'SUPPLIER_FAILURE', 'CONTRACT_GOVERNANCE', 'FACILITY_RESERVE', 'ASSET_SERVICING'] as const;
export type Kind = (typeof KINDS)[number];

export type OpsRow<T = Record<string, unknown>> = { id: string; kind: string; key: string; status: string; data: T; createdBy: string | null; createdAt: Date; updatedAt: Date };

function parse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

const inflate = <T>(row: { id: string; kind: string; key: string; status: string; data: string; createdBy: string | null; createdAt: Date; updatedAt: Date }): OpsRow<T> => ({ ...row, data: parse<T>(row.data) });

export async function listRecords<T = Record<string, unknown>>(kind: Kind, where: { key?: string; status?: string } = {}) {
  const rows = await prisma.opsRecord.findMany({ where: { kind, ...where }, orderBy: { updatedAt: 'desc' }, take: 500 });
  return rows.map((row) => inflate<T>(row));
}

async function audit(userId: string, action: string, id: string, changes: unknown) {
  await prisma.auditLog.create({ data: { userId, action, entityType: 'OPS_RECORD', entityId: id, changes: JSON.stringify(changes) } }).catch(() => undefined);
}

export async function createRecord<T extends object>(kind: Kind, key: string, data: T, userId: string, status = 'OPEN') {
  const row = await prisma.opsRecord.create({ data: { kind, key, status, data: JSON.stringify(data), createdBy: userId } });
  await audit(userId, `${kind}_CREATED`, row.id, { previous: null, next: { key, status, data } });
  return inflate<T>(row);
}

export async function updateRecord<T extends object>(id: string, patch: { status?: string; data?: Partial<T> }, userId: string) {
  const current = await prisma.opsRecord.findUnique({ where: { id } });
  if (!current) throw new Error('Record not found');
  const previous = { status: current.status, data: parse<T>(current.data) };
  const nextData = patch.data ? { ...previous.data, ...patch.data } : previous.data;
  const row = await prisma.opsRecord.update({ where: { id }, data: { status: patch.status ?? current.status, data: JSON.stringify(nextData) } });
  await audit(userId, `${current.kind}_UPDATED`, id, { previous, next: { status: row.status, data: nextData } });
  return inflate<T>(row);
}
