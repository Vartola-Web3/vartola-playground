import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { generateSimulatedTxHash } from '@/lib/stellar/config';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolId, amount } = body;

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool || pool.status !== 'OPEN') {
      return NextResponse.json({ error: 'Pool not available' }, { status: 400 });
    }

    if (amount < pool.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is ${pool.minInvestment}` },
        { status: 400 }
      );
    }

    const shares = amount / pool.targetAmount;

    const investment = await prisma.investment.create({
      data: {
        investorId: session.user.id,
        poolId,
        amount,
        shares,
        status: 'ACTIVE',
        stellarTxHash: generateSimulatedTxHash(),
        activatedAt: new Date(),
      },
    });

    await prisma.pool.update({
      where: { id: poolId },
      data: {
        raisedAmount: {
          increment: amount,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'INVESTMENT_SUBSCRIBED',
        entityType: 'Investment',
        entityId: investment.id,
        changes: JSON.stringify({ poolId, amount, shares }),
      },
    });

    return NextResponse.json({ success: true, investment });
  } catch (error) {
    console.error('Investment subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to pool' },
      { status: 500 }
    );
  }
}
