import { prisma } from '@/lib/db';
import { allocateWaterfall, assertCapacity, poolAvailable } from '@/lib/marketplace/allocate';
import { ensureFacilityOnChain, subscribeAndReserve } from '@/lib/alpha/chain';
import { mirrorChainEvent } from '@/lib/alpha/journal';
import { vtaedBalance } from '@/lib/stellar/assets/vtaed';
import { ensureEmbeddedWallet } from '@/lib/stellar/wallets/provider';
import { facilityContractId } from '@/lib/stellar/keys';

export async function subscribeAlpha(input: { investorId: string; investorName: string; poolId: string; amount: number }) {
  const user = await prisma.user.findUnique({ where: { id: input.investorId } });
  if (!user || user.accountStatus !== 'ACTIVE') {
    throw new Error('Complete email, phone, and KYC verification before investing');
  }
  const compliance = await prisma.complianceCase.findUnique({
    where: { subjectType_subjectId: { subjectType: 'INDIVIDUAL', subjectId: input.investorId } },
  });
  if (!compliance || (compliance.status !== 'VERIFIED' && compliance.status !== 'APPROVED')) {
    throw new Error('KYC approval is required before an Alpha investment');
  }
  const wallet = await ensureEmbeddedWallet(input.investorId);
  const balance = await vtaedBalance(wallet.publicKey);
  if (balance + 0.001 < input.amount) throw new Error('Insufficient VTAED balance');

  const pool = await prisma.pool.findUnique({
    where: { id: input.poolId },
    include: { facilities: true },
  });
  if (!pool || pool.status !== 'OPEN') throw new Error('Pool is not open');
  const available = poolAvailable(pool.targetAmount, pool.raisedAmount);
  const problem = assertCapacity(input.amount, available, pool.minInvestment);
  if (problem) throw new Error(problem);
  const plan = allocateWaterfall(
    pool.facilities.map((facility) => ({
      id: facility.id,
      required: facility.financeAmount,
      funded: facility.fundedAmount,
      priority: facility.priorityOrder,
    })),
    input.amount,
  );
  if (plan.unallocated > 0) throw new Error(`Maximum available allocation is ${available}`);

  const investment = await prisma.investment.create({
    data: {
      investorId: input.investorId,
      poolId: pool.id,
      amount: input.amount,
      shares: input.amount / pool.targetAmount,
      status: 'PENDING',
      chainStatus: 'CHAIN_PENDING',
      reservedAmount: input.amount,
      deployedAmount: 0,
      termsSnapshot: JSON.stringify({ poolName: pool.poolName, acceptedAt: new Date().toISOString(), asset: 'VTAED' }),
    },
  });

  try {
    let units = 0;
    let txHash = '';
    let ledger = 0;
    for (const slice of plan.allocations) {
      await ensureFacilityOnChain(slice.facilityId);
      const chain = await subscribeAndReserve(input.investorId, slice.facilityId, slice.amount);
      units += chain.units;
      txHash = chain.txHash;
      ledger = chain.ledger;
      await prisma.facilityAllocation.create({
        data: {
          investmentId: investment.id,
          facilityId: slice.facilityId,
          investorId: input.investorId,
          poolId: pool.id,
          allocatedAmount: slice.amount,
          reservedAmount: slice.amount,
          participationUnits: chain.units,
          status: 'RESERVED',
        },
      });
      await prisma.facility.update({
        where: { id: slice.facilityId },
        data: {
          fundedAmount: slice.fundedAfter,
          participationUnits: { increment: chain.units },
          status: slice.fundedAfter >= slice.required ? 'FUNDED' : 'FUNDING',
        },
      });
    }
    const raisedAmount = pool.raisedAmount + input.amount;
    await prisma.pool.update({
      where: { id: pool.id },
      data: { raisedAmount, status: raisedAmount >= pool.targetAmount ? 'FUNDED' : 'OPEN' },
    });
    const confirmed = await prisma.investment.update({
      where: { id: investment.id },
      data: { status: 'ACTIVE', chainStatus: 'CHAIN_CONFIRMED', participationUnits: units, stellarTxHash: txHash, chainError: null },
    });
    await mirrorChainEvent({
      eventType: 'InvestmentSubscribed',
      txHash,
      ledger,
      contractId: facilityContractId(),
      entityType: 'Investment',
      entityId: investment.id,
      title: 'Investment',
      payload: { amount: input.amount, units },
    });
    return {
      investment: confirmed,
      poolFullyFunded: raisedAmount >= pool.targetAmount,
      reviewUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
      txHash,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Soroban subscription failed';
    await prisma.investment.update({
      where: { id: investment.id },
      data: { status: 'FAILED', chainStatus: 'CHAIN_FAILED', chainError: message },
    });
    throw new Error(message);
  }
}
