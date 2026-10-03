import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

import { prisma } from '@/lib/db';
import { isAdminOperator } from '@/lib/auth/roles';
import { publishPoolSnapshot } from '@/lib/stellar/sync';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdminOperator(session.user.role)) {
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
        const size = pool.facilities.reduce((sum, facility) => sum + facility.financeAmount, 0);
        const targetAmount = pool.targetAmount > 0 ? pool.targetAmount : size;
        if (targetAmount !== pool.targetAmount) {
          await prisma.pool.update({ where: { id: pool.id }, data: { targetAmount } });
        }
        return {
          ...pool,
          targetAmount,
          status: pool.facilities.length === 0 ? 'DRAFT' : pool.status,
        };
      })
    );

    const approved = await prisma.application.findMany({
      where: { status: { in: ['APPROVED', 'FUNDED'] } },
      include: {
        facility: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const availableFacilities = approved
      .filter((application) => application.facility && !application.facility.poolId)
      .map((application) => ({
        id: application.facility!.id,
        facilityNo: application.facility!.facilityNo,
        financeAmount: application.facility!.financeAmount,
        application: {
          applicationNo: application.applicationNo,
          assetDescription: application.assetDescription,
          status: application.status,
        },
      }));

    return NextResponse.json({ pools: withTotals, availableFacilities });
  } catch (error) {
    console.error('Pools fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdminOperator(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolName, minInvestment, targetReturn, assetFocus, facilityIds } = body;
    const ids = Array.isArray(facilityIds) ? facilityIds.filter((id: unknown) => typeof id === 'string') : [];

    const poolCount = await prisma.pool.count();
    const poolNo = `POOL-${new Date().getFullYear()}-${String(poolCount + 1).padStart(3, '0')}`;

    const facilities = ids.length
      ? await prisma.facility.findMany({ where: { id: { in: ids }, poolId: null } })
      : [];
    const amount = facilities.reduce((sum, facility) => sum + facility.financeAmount, 0);

    if (!poolName || !assetFocus || !Number.isFinite(minInvestment) || !Number.isFinite(targetReturn)) {
      return NextResponse.json({ error: 'Complete all required opportunity fields' }, { status: 400 });
    }

    const pool = await prisma.pool.create({
      data: {
        poolNo,
        poolName,
        targetAmount: amount,
        minInvestment,
        targetReturn,
        assetFocus,
        status: facilities.length ? 'OPEN' : 'DRAFT',
        raisedAmount: 0,
        stellarPoolId: null,
        stellarTxHash: null,
        openedAt: facilities.length ? new Date() : null,
        facilities: facilities.length
          ? { connect: facilities.map((facility) => ({ id: facility.id })) }
          : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'POOL_CREATED',
        entityType: 'Pool',
        entityId: pool.id,
        changes: JSON.stringify({ poolNo, poolName, targetAmount: amount }),
      },
    });

    let chainError = '';
    try {
      const txHash = await publishPoolSnapshot(pool.id);
      if (txHash) await prisma.pool.update({ where: { id: pool.id }, data: { stellarTxHash: txHash } });
    } catch (error) {
      chainError = error instanceof Error ? error.message : 'Could not record this opportunity on Stellar';
    }

    return NextResponse.json({ success: true, pool, chainError });
  } catch (error) {
    console.error('Pool creation error:', error);
    return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 });
  }
}
