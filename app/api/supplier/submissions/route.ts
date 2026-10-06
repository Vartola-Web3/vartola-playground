import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { rateLimit } from '@/lib/security/rate-limit';
import { assignedFacilities, submitEvidence, supplierForUser } from '@/lib/supplier/service';

export const dynamic = 'force-dynamic';

async function supplierSession() {
  const session = await auth();
  return session?.user && session.user.role === 'SUPPLIER' ? session.user : null;
}

export async function GET() {
  const user = await supplierSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supplier = await supplierForUser(user.id);
  if (!supplier) return NextResponse.json({ error: 'This account is not linked to a supplier' }, { status: 403 });
  return NextResponse.json({ supplier: { id: supplier.id, companyName: supplier.companyName, kybStatus: supplier.kybStatus }, facilities: await assignedFacilities(supplier.id) });
}

// A supplier submits evidence (invoice, VIN or serial, delivery confirmation, delivery evidence). Nothing here can
// approve a release or change terms: those decisions stay with operations and the contract.
export async function POST(request: NextRequest) {
  const user = await supplierSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    rateLimit(request, 'supplier-submit', 20);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Too many requests' }, { status: 429 });
  }
  const form = await request.formData();
  const file = form.get('file');
  const amount = form.get('amount');
  try {
    const row = await submitEvidence({
      userId: user.id,
      facilityId: String(form.get('facilityId') || ''),
      fields: { kind: String(form.get('kind') || ''), reference: String(form.get('reference') || ''), amount: amount ? Number(amount) : null, serial: String(form.get('serial') || '') },
      file: file instanceof File && file.size > 0 ? { bytes: Buffer.from(await file.arrayBuffer()), name: file.name, type: file.type } : undefined,
    });
    return NextResponse.json({ submission: { id: row.id, kind: row.kind, status: row.status } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the submission' }, { status: 400 });
  }
}
