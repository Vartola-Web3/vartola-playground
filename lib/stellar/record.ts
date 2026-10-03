import { prisma } from '@/lib/db';
import { financialMode } from '@/lib/simulation/ledger';
import { stellarReviewUrl } from '@/lib/stellar/explorer';
import { enqueueJob, processJob, type JobType } from '@/lib/stellar/outbox/queue';

const REAL_HASH = /^[a-f0-9]{64}$/i;

export async function recordChainEvent(input: {
  type: JobType;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}) {
  if ((await financialMode()) !== 'STELLAR_TESTNET') return null;
  const jobId = await enqueueJob(input);
  const txHash = await processJob(jobId);
  if (!txHash || !REAL_HASH.test(txHash)) {
    const job = await prisma.stellarTransaction.findUnique({ where: { id: jobId } });
    throw new Error(job?.error || 'Stellar did not confirm this operation');
  }
  await persistHash(input.entityType, input.entityId, txHash);
  return { txHash, reviewUrl: stellarReviewUrl(txHash)! };
}

export async function tryRecordChainEvent(input: {
  type: JobType;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}) {
  try {
    return await recordChainEvent(input);
  } catch (error) {
    console.error('Stellar record failed:', error);
    return null;
  }
}

export async function recordTopUp(idempotencyKey: string, payload: Record<string, unknown>) {
  const entry = await prisma.simLedgerEntry.findUnique({ where: { idempotencyKey } });
  if (!entry) return null;
  return tryRecordChainEvent({
    type: 'FUND_WALLET',
    entityType: 'TopUp',
    entityId: entry.id,
    payload,
  });
}

export async function latestReviewUrls(entityType: string, entityIds: string[]) {
  const urls = new Map<string, string>();
  if (!entityIds.length) return urls;
  const rows = await prisma.stellarTransaction.findMany({
    where: { entityType, entityId: { in: entityIds }, status: 'CONFIRMED' },
    orderBy: { createdAt: 'desc' },
    select: { entityId: true, txHash: true },
  });
  for (const row of rows) {
    if (urls.has(row.entityId)) continue;
    const url = stellarReviewUrl(row.txHash);
    if (url) urls.set(row.entityId, url);
  }
  return urls;
}

async function persistHash(entityType: string, entityId: string, txHash: string) {
  if (entityType === 'Pool') {
    const row = await prisma.pool.findUnique({ where: { id: entityId }, select: { stellarTxHash: true } });
    if (!row?.stellarTxHash || !REAL_HASH.test(row.stellarTxHash)) {
      await prisma.pool.update({ where: { id: entityId }, data: { stellarTxHash: txHash } });
    }
  }
  if (entityType === 'Facility') {
    const row = await prisma.facility.findUnique({ where: { id: entityId }, select: { stellarTxHash: true } });
    if (!row?.stellarTxHash || !REAL_HASH.test(row.stellarTxHash)) {
      await prisma.facility.update({ where: { id: entityId }, data: { stellarTxHash: txHash } });
    }
  }
  if (entityType === 'Investment') {
    const row = await prisma.investment.findUnique({ where: { id: entityId }, select: { stellarTxHash: true } });
    if (!row?.stellarTxHash || !REAL_HASH.test(row.stellarTxHash)) {
      await prisma.investment.update({ where: { id: entityId }, data: { stellarTxHash: txHash } });
    }
  }
  if (entityType === 'Payment') {
    await prisma.payment.update({ where: { id: entityId }, data: { stellarTxHash: txHash } });
  }
  if (entityType === 'Distribution') {
    await prisma.distribution.update({ where: { id: entityId }, data: { stellarTxHash: txHash } });
  }
  if (entityType === 'FacilityRelease') {
    await prisma.facilityRelease.update({ where: { id: entityId }, data: { txHash } });
  }
}
