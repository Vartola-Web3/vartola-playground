import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { enqueueJob, processJob } from '@/lib/stellar/outbox';

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

    if (!pool || !['OPEN', 'FUNDING', 'ACTIVE'].includes(pool.status)) {
      return NextResponse.json({ error: 'Pool not available' }, { status: 400 });
    }

    if (amount < pool.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is ${pool.minInvestment}` },
        { status: 400 }
      );
    }

    const shares = amount / pool.targetAmount;

    // Create investment record
    const investment = await prisma.investment.create({
      data: {
        investorId: session.user.id,
        poolId,
        amount,
        shares,
        status: 'PENDING',
      },
    });

    // Enqueue blockchain job
    const jobId = await enqueueJob({
      type: 'SUBSCRIBE_POOL',
      entityType: 'Investment',
      entityId: investment.id,
      payload: {
        investorId: session.user.id,
        poolId,
        amount,
        shares,
      },
    });

    // Process job immediately (async)
    processJob(jobId).then(async (txHash) => {
      if (txHash) {
        // Update investment with tx hash and mark as active
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            stellarTxHash: txHash,
            status: 'ACTIVE',
            activatedAt: new Date(),
          },
        });

      }
    }).catch(error => {
      console.error('Failed to process subscription job:', error);
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'INVESTMENT_SUBSCRIBED',
        entityType: 'Investment',
        entityId: investment.id,
        changes: JSON.stringify({ poolId, amount, shares, jobId }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      investment,
      jobId,
      message: 'Subscription queued for blockchain processing'
    });
  } catch (error) {
    console.error('Investment subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to pool' },
      { status: 500 }
    );
  }
}
