import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { isAdminOperator } from '@/lib/auth/roles';
import { publishPoolSnapshot } from '@/lib/stellar/sync';

async function syncPoolCapacity(poolId: string) {
  const linked = await prisma.facility.findMany({
    where: { poolId },
    select: { financeAmount: true },
  });
  const amount = linked.reduce((sum, item) => sum + item.financeAmount, 0);
  const pool = await prisma.pool.findUnique({ where: { id: poolId } });
  if (!pool) return;
  await prisma.pool.update({
    where: { id: poolId },
    data: {
      targetAmount: amount,
      status: linked.length === 0 ? 'DRAFT' : pool.status === 'DRAFT' ? 'OPEN' : pool.status,
      openedAt: linked.length > 0 && !pool.openedAt ? new Date() : pool.openedAt,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  if (body.recordOnChain) {
    try {
      const txHash = await publishPoolSnapshot(id);
      return NextResponse.json({ success: true, txHash });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Stellar recording failed' }, { status: 502 });
    }
  }

  const facility = await prisma.facility.findUnique({ where: { id: body.facilityId } });
  if (!facility) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  if (facility.poolId && facility.poolId !== id) {
    return NextResponse.json({ error: 'This asset is already in another pool' }, { status: 400 });
  }

  if (body.remove) {
    await prisma.facility.update({ where: { id: facility.id }, data: { poolId: null } });
  } else {
    await prisma.facility.update({ where: { id: facility.id }, data: { poolId: id } });
  }
  await syncPoolCapacity(id);
  let chainError = '';
  try {
    await publishPoolSnapshot(id);
  } catch (error) {
    chainError = error instanceof Error ? error.message : 'Stellar recording failed';
  }
  return NextResponse.json({ success: true, chainError });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pool = await prisma.pool.findUnique({ where: { id }, include: { investments: true } });
  if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });

  const investmentIds = pool.investments.map((investment) => investment.id);
  if (investmentIds.length > 0) {
    await prisma.distribution.deleteMany({ where: { investmentId: { in: investmentIds } } });
    await prisma.investment.deleteMany({ where: { poolId: id } });
  }
  await prisma.facility.updateMany({ where: { poolId: id }, data: { poolId: null } });
  await prisma.pool.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
