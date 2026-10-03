import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { isAdminOperator } from '@/lib/auth/roles';

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const transactions = await prisma.stellarTransaction.findMany({
    orderBy: { createdAt: 'desc' }, take: 100,
    select: { id: true, type: true, entityType: true, entityId: true, status: true, txHash: true, error: true, attempts: true, createdAt: true, confirmedAt: true },
  });
  return NextResponse.json({ transactions });
}
