import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Platform owner links an existing user account to a supplier and gives it the SUPPLIER role.
// It changes only the link and the role of that one account, and writes an audit record.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { email: String(body.email || '').toLowerCase() } });
  const supplier = await prisma.supplier.findUnique({ where: { id: String(body.supplierId || '') } });
  if (!user || !supplier) return NextResponse.json({ error: 'User or supplier not found' }, { status: 404 });
  if (['ADMIN', 'ADMIN_REVIEWER', 'UNDERWRITER'].includes(user.role)) return NextResponse.json({ error: 'Staff accounts cannot be converted to supplier accounts' }, { status: 400 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: 'SUPPLIER' } }),
    prisma.supplierUser.upsert({ where: { userId: user.id }, create: { userId: user.id, supplierId: supplier.id }, update: { supplierId: supplier.id } }),
    prisma.auditLog.create({ data: { userId: session.user.id, action: 'SUPPLIER_USER_LINKED', entityType: 'Supplier', entityId: supplier.id, changes: JSON.stringify({ userId: user.id }) } }),
  ]);
  return NextResponse.json({ linked: true });
}
