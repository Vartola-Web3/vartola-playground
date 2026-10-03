import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { tryRecordChainEvent } from '@/lib/stellar/record';
import { allocateWaterfall, assertCapacity, poolAvailable } from '@/lib/marketplace/allocate';
import { ensureWallet } from '@/lib/simulation/ledger';
import { activateFundedSimulationPool } from '@/lib/lifecycle/service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { poolId, amount } = body;
    const investmentAmount = Number(amount);
    if (!Number.isFinite(investmentAmount) || investmentAmount <= 0) {
      return NextResponse.json({ error: 'Enter a valid investment amount' }, { status: 400 });
    }
    await ensureWallet('INVESTOR', session.user.id, session.user.name || 'Investor');

    const result = await prisma.$transaction(async (tx) => {
      const pool = await tx.pool.findUnique({
        where: { id: poolId },
        include: { facilities: { include: { application: { include: { company: true } } } }, investments: true },
      });
      if (!pool || pool.status !== 'OPEN') {
        throw new Error('Pool is not open');
      }
      const available = poolAvailable(pool.targetAmount, pool.raisedAmount);
      const problem = assertCapacity(investmentAmount, available, pool.minInvestment);
      if (problem) throw new Error(problem);

      {
        const wallet = await tx.simWallet.findUnique({ where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } } });
        if (!wallet || wallet.available + 0.001 < investmentAmount) throw new Error('Insufficient wallet balance. Add demo funds first.');
      }

      const plan = allocateWaterfall(
        pool.facilities.map((facility) => ({
          id: facility.id,
          required: facility.financeAmount,
          funded: facility.fundedAmount,
          priority: facility.priorityOrder,
        })),
        investmentAmount
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
          amount: investmentAmount,
          shares: investmentAmount / pool.targetAmount,
          status: 'ACTIVE',
          reservedAmount: investmentAmount,
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

      const raisedAmount = pool.raisedAmount + investmentAmount;
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
          amount: investmentAmount,
          refId: investment.id,
          note: pool.poolName,
        },
      });
      {
        const wallet = await tx.simWallet.findUnique({ where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } } });
        if (!wallet) throw new Error('Investor wallet is missing');
        await tx.simWallet.update({ where: { id: wallet.id }, data: { available: wallet.available - investmentAmount, reserved: wallet.reserved + investmentAmount } });
        await tx.simLedgerEntry.create({
          data: {
            walletId: wallet.id, type: 'INVESTMENT_RESERVE', direction: 'OUT', amount: investmentAmount,
            balanceBefore: wallet.available, balanceAfter: wallet.available - investmentAmount,
            idempotencyKey: `reserve:${investment.id}`, referenceType: 'Investment', referenceId: investment.id,
            description: `Investment reserved for ${pool.poolName}`, createdBy: session.user.id,
          },
        });
      }
      return { investment, poolFullyFunded: raisedAmount >= pool.targetAmount };
    });

    const { investment, poolFullyFunded } = result;
    if (poolFullyFunded) await activateFundedSimulationPool(poolId, session.user.id);

    const recorded = await tryRecordChainEvent({
      type: 'SUBSCRIBE_POOL',
      entityType: 'Investment',
      entityId: investment.id,
      payload: { investorId: session.user.id, poolId, amount: investmentAmount, shares: investment.shares },
    });
    const jobId = recorded?.txHash || null;

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
      reviewUrl: recorded?.reviewUrl || null,
      message: poolFullyFunded
        ? 'Investment confirmed. The opportunity is fully funded and its payment schedule is now active.'
        : 'Investment confirmed and reserved until the opportunity is fully funded.'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe to pool';
    const status = /Minimum|Maximum|not open|Insufficient|valid investment/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
