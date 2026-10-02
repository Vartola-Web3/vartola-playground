import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { generateSimulatedPoolId, generateSimulatedTxHash } from '@/lib/stellar/config';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pools = await prisma.pool.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        facilities: {
          include: { application: { select: { applicationNo: true, assetDescription: true, status: true } } },
        },
      },
    });

    const withTotals = await Promise.all(
      pools.map(async (pool) => {
        const raisedAmount = pool.facilities.reduce((sum, facility) => sum + facility.financeAmount, 0);
        if (raisedAmount !== pool.raisedAmount) {
          await prisma.pool.update({ where: { id: pool.id }, data: { raisedAmount } });
        }
        return { ...pool, raisedAmount };
      })
    );

    const availableFacilities = await prisma.facility.findMany({
      where: { poolId: null },
      include: { application: { select: { applicationNo: true, assetDescription: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pools: withTotals, availableFacilities });
  } catch (error) {
    console.error('Pools fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolName, targetAmount, minInvestment, targetReturn, assetFocus } = body;

    const poolCount = await prisma.pool.count();
    const poolNo = `POOL-${new Date().getFullYear()}-${String(poolCount + 1).padStart(3, '0')}`;

    const pool = await prisma.pool.create({
      data: {
        poolNo,
        poolName,
        targetAmount,
        minInvestment,
        targetReturn,
        assetFocus,
        status: 'OPEN',
        raisedAmount: 0,
        stellarPoolId: generateSimulatedPoolId(),
        stellarTxHash: generateSimulatedTxHash(),
        openedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'POOL_CREATED',
        entityType: 'Pool',
        entityId: pool.id,
        changes: JSON.stringify({ poolNo, poolName, targetAmount }),
      },
    });

    return NextResponse.json({ success: true, pool });
  } catch (error) {
    console.error('Pool creation error:', error);
    return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 });
  }
}
