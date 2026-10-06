import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { canApp, type Action } from '@/lib/ops/roles';
import { KINDS, createRecord, listRecords, updateRecord, type Kind } from '@/lib/ops/records';
import { validateEntry } from '@/lib/ops/pilots';
import { applyStageChange, type CollectionStage } from '@/lib/servicing/collections';
import { resolveFailure, FAILURE_OUTCOMES } from '@/lib/supplier/performance';

export const dynamic = 'force-dynamic';

const REQUIRED_ACTION: Record<Kind, Action> = {
  PILOT: 'manage_pilots',
  COLLECTION_CASE: 'manage_collections',
  SERVICING_EVENT: 'manage_collections',
  INSURANCE_CLAIM: 'manage_collections',
  SUPPLIER_FAILURE: 'manage_collections',
  CONTRACT_GOVERNANCE: 'upgrade_contract',
  FACILITY_RESERVE: 'manage_collections',
  ASSET_SERVICING: 'manage_collections',
};

async function actor() {
  const session = await auth();
  return session?.user && isAdminOperator(session.user.role) ? session.user : null;
}

const kindOf = (value: unknown) => (KINDS as readonly string[]).includes(String(value)) ? (value as Kind) : null;

export async function GET(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const kind = kindOf(request.nextUrl.searchParams.get('kind'));
  if (!kind) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 });
  return NextResponse.json({ records: await listRecords(kind) });
}

export async function POST(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const kind = kindOf(body.kind);
  if (!kind) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 });
  if (!canApp(user.role, REQUIRED_ACTION[kind])) return NextResponse.json({ error: 'Your role may not perform this action' }, { status: 403 });
  try {
    if (kind === 'PILOT') validateEntry({ ...body.data, type: body.data?.type, stage: body.data?.stage });
    if (kind === 'SUPPLIER_FAILURE') resolveFailure(FAILURE_OUTCOMES.includes(body.data?.outcome) ? body.data.outcome : 'REPLACE_SUPPLIER', body.data?.authorizedBy || null);
    const record = await createRecord(kind, String(body.key || body.data?.name || kind), body.data || {}, user.id, body.status || 'OPEN');
    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const kind = kindOf(body.kind);
  if (!kind || !body.id) return NextResponse.json({ error: 'kind and id are required' }, { status: 400 });
  if (!canApp(user.role, REQUIRED_ACTION[kind])) return NextResponse.json({ error: 'Your role may not perform this action' }, { status: 403 });
  try {
    if (kind === 'COLLECTION_CASE' && body.status) {
      const [current] = (await listRecords(kind)).filter((row) => row.id === body.id);
      if (!current) throw new Error('Case not found');
      applyStageChange(current.status as CollectionStage, body.status as CollectionStage);
    }
    const record = await updateRecord(body.id, { status: body.status, data: body.data }, user.id);
    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 });
  }
}
