import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { prisma } from '@/lib/db';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/contact/inquiry';

export const dynamic = 'force-dynamic';

async function admin() {
  const session = await auth();
  return session?.user && isAdminOperator(session.user.role) ? session.user : null;
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  return NextResponse.json({ contacts: rows.map(({ ipHash, ...row }) => { void ipHash; return row; }) });
}

// Change status or add an internal note. Every change is written to the audit log with the previous and new state.
export async function PATCH(request: NextRequest) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const current = body.id ? await prisma.contactInquiry.findUnique({ where: { id: String(body.id) } }) : null;
  if (!current) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
  const data: { status?: string; notes?: string } = {};
  if (body.status !== undefined) {
    if (!(CONTACT_STATUSES as readonly string[]).includes(body.status)) return NextResponse.json({ error: 'Unknown status' }, { status: 400 });
    data.status = body.status as ContactStatus;
  }
  if (typeof body.note === 'string' && body.note.trim()) {
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    data.notes = `${current.notes ? current.notes + '\n' : ''}[${stamp}] ${body.note.trim().slice(0, 1000)}`;
  }
  if (!data.status && !data.notes) return NextResponse.json({ error: 'Nothing to change' }, { status: 400 });
  const row = await prisma.contactInquiry.update({ where: { id: current.id }, data });
  await prisma.auditLog.create({ data: { userId: user.id, action: 'CONTACT_UPDATED', entityType: 'CONTACT_INQUIRY', entityId: current.id, changes: JSON.stringify({ previous: { status: current.status }, next: { status: row.status, noteAdded: Boolean(data.notes) } }) } }).catch(() => undefined);
  const { ipHash, ...safe } = row;
  void ipHash;
  return NextResponse.json({ contact: safe });
}
