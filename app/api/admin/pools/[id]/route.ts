import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

async function syncRaised(poolId: string) {
  const linked = await prisma.facility.findMany({
    where: { poolId },
    select: { financeAmount: true },
  });
  const amount = linked.reduce((sum, item) => sum + item.financeAmount, 0);
  const pool = await prisma.pool.findUnique({ where: { id: poolId } });
  if (pool && pool.raisedAmount === 0) {
    await prisma.pool.update({ where: { id: poolId }, data: { targetAmount: amount } });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
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
  await syncRaised(id);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
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
