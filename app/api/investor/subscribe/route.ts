import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { enqueueJob, processJob } from '@/lib/stellar/outbox';
import { allocateWaterfall, assertCapacity, poolAvailable } from '@/lib/marketplace/allocate';
import { financialMode, moveAvailableToReserved } from '@/lib/simulation/ledger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolId, amount } = body;

    const result = await prisma.$transaction(async (tx) => {
      const pool = await tx.pool.findUnique({
        where: { id: poolId },
        include: { facilities: { include: { application: { include: { company: true } } } }, investments: true },
      });
      if (!pool || pool.status !== 'OPEN') {
        throw new Error('Pool is not open');
      }
      const available = poolAvailable(pool.targetAmount, pool.raisedAmount);
      const problem = assertCapacity(Number(amount), available, pool.minInvestment);
      if (problem) throw new Error(problem);

      const plan = allocateWaterfall(
        pool.facilities.map((facility) => ({
          id: facility.id,
          required: facility.financeAmount,
          funded: facility.fundedAmount,
          priority: facility.priorityOrder,
        })),
        Number(amount)
      );
      if (plan.unallocated > 0) {
        throw new Error(`Maximum available allocation is ${available}`);
      }

      const snapshot = JSON.stringify({
        poolName: pool.poolName,
        riskRating: pool.riskRating,
        riskScore: pool.riskScore,
        yield: pool.targetReturn,
        termMonths: pool.termMonths,
        incompletePolicy: pool.incompletePolicy,
        acceptedAt: new Date().toISOString(),
      });

      const investment = await tx.investment.create({
        data: {
          investorId: session.user.id,
          poolId,
          amount: Number(amount),
          shares: Number(amount) / pool.targetAmount,
          status: 'ACTIVE',
          reservedAmount: Number(amount),
          deployedAmount: 0,
          termsSnapshot: snapshot,
          stellarTxHash: null,
        },
      });

      for (const slice of plan.allocations) {
        await tx.facilityAllocation.create({
          data: {
            investmentId: investment.id,
            facilityId: slice.facilityId,
            investorId: session.user.id,
            poolId,
            allocatedAmount: slice.amount,
            reservedAmount: slice.amount,
            status: slice.fundedAfter >= slice.required ? 'RESERVED' : 'RESERVED',
          },
        });
        await tx.facility.update({
          where: { id: slice.facilityId },
          data: {
            fundedAmount: slice.fundedAfter,
            status: slice.fundedAfter >= slice.required ? 'FULLY_FUNDED' : 'FUNDING',
          },
        });
      }

      const raisedAmount = pool.raisedAmount + Number(amount);
      await tx.pool.update({
        where: { id: pool.id },
        data: {
          raisedAmount,
          status: raisedAmount >= pool.targetAmount ? 'FULLY_FUNDED' : 'OPEN',
        },
      });
      await tx.walletLedger.create({
        data: {
          userId: session.user.id,
          type: 'RESERVE',
          amount: Number(amount),
          refId: investment.id,
          note: pool.poolName,
        },
      });
      return investment;
    });

    const investment = result;
    if ((await financialMode()) === 'SIMULATION') {
      await moveAvailableToReserved(session.user.id, Number(amount), `reserve:${investment.id}`, session.user.id);
    }

    // Enqueue blockchain job
    const jobId = await enqueueJob({
      type: 'SUBSCRIBE_POOL',
      entityType: 'Investment',
      entityId: investment.id,
      payload: {
        investorId: session.user.id,
        poolId,
        amount,
        shares: investment.shares,
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
        changes: JSON.stringify({ poolId, amount, jobId }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      investment,
      jobId,
      message: 'Subscription queued for blockchain processing'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe to pool';
    const status = /Minimum|Maximum|not open/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
