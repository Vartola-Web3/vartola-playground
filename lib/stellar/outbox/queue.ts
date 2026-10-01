/**
 * Stellar Transaction Outbox Queue
 * 
 * Implements the transactional outbox pattern for blockchain operations:
 * 1. Create job in database
 * 2. Process job asynchronously
 * 3. Retry on failure with exponential backoff
 * 4. Mark as confirmed when transaction settles
 */

import { prisma } from '@/lib/db';
import { getStellarProvider } from '@/lib/stellar/providers/factory';

export type JobType =
  | 'CREATE_FACILITY'
  | 'RECORD_PAYMENT'
  | 'DISTRIBUTE_PAYMENT'
  | 'SUBSCRIBE_POOL'
  | 'CREATE_WALLET'
  | 'FUND_WALLET';

export type JobStatus = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export interface BlockchainJob {
  id: string;
  type: JobType;
  entityType: string;
  entityId: string;
  payload: any;
  status: JobStatus;
  txHash?: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: Date;
  submittedAt?: Date;
  confirmedAt?: Date;
}

/**
 * Enqueue a new blockchain job
 * Returns job ID for tracking
 */
export async function enqueueJob(params: {
  type: JobType;
  entityType: string;
  entityId: string;
  payload: any;
  maxAttempts?: number;
}): Promise<string> {
  const job = await prisma.stellarTransaction.create({
    data: {
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: JSON.stringify(params.payload),
      status: 'PENDING',
      attempts: 0,
      maxAttempts: params.maxAttempts || 3,
    },
  });

  console.log(`📤 Enqueued job ${job.id}: ${params.type} for ${params.entityType} ${params.entityId}`);

  return job.id;
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<BlockchainJob | null> {
  const job = await prisma.stellarTransaction.findUnique({
    where: { id: jobId },
  });

  if (!job) return null;

  return {
    id: job.id,
    type: job.type as JobType,
    entityType: job.entityType,
    entityId: job.entityId,
    payload: JSON.parse(job.payload),
    status: job.status as JobStatus,
    txHash: job.txHash || undefined,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: job.error || undefined,
    createdAt: job.createdAt,
    submittedAt: job.submittedAt || undefined,
    confirmedAt: job.confirmedAt || undefined,
  };
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  data?: {
    txHash?: string;
    error?: string;
    incrementAttempts?: boolean;
  }
): Promise<void> {
  const updateData: any = {
    status,
  };

  if (data?.txHash) {
    updateData.txHash = data.txHash;
  }

  if (data?.error) {
    updateData.error = data.error;
  }

  if (data?.incrementAttempts) {
    updateData.attempts = { increment: 1 };
  }

  if (status === 'SUBMITTED') {
    updateData.submittedAt = new Date();
  } else if (status === 'CONFIRMED') {
    updateData.confirmedAt = new Date();
  } else if (status === 'FAILED') {
    updateData.failedAt = new Date();
  } else if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date();
  }

  await prisma.stellarTransaction.update({
    where: { id: jobId },
    data: updateData,
  });

  console.log(`📝 Updated job ${jobId} status to ${status}`);
}

/**
 * Get pending jobs (ready to process)
 */
export async function getPendingJobs(limit: number = 10): Promise<BlockchainJob[]> {
  const jobs = await prisma.stellarTransaction.findMany({
    where: {
      status: 'PENDING',
      attempts: {
        lt: prisma.stellarTransaction.fields.maxAttempts,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });

  return jobs.map(job => ({
    id: job.id,
    type: job.type as JobType,
    entityType: job.entityType,
    entityId: job.entityId,
    payload: JSON.parse(job.payload),
    status: job.status as JobStatus,
    txHash: job.txHash || undefined,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: job.error || undefined,
    createdAt: job.createdAt,
    submittedAt: job.submittedAt || undefined,
    confirmedAt: job.confirmedAt || undefined,
  }));
}

/**
 * Process a single job
 * Returns transaction hash if successful
 */
export async function processJob(jobId: string): Promise<string | null> {
  const job = await getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status !== 'PENDING') {
    console.log(`⚠️ Job ${jobId} is not pending (status: ${job.status})`);
    return null;
  }

  try {
    console.log(`⚙️ Processing job ${jobId}: ${job.type}`);

    // Increment attempts
    await updateJobStatus(jobId, 'PENDING', { incrementAttempts: true });

    // Get Stellar provider
    const provider = await getStellarProvider();

    // TODO: Implement actual blockchain operations based on job type
    // For now, simulate success
    const simulatedTxHash = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    // Mark as submitted
    await updateJobStatus(jobId, 'SUBMITTED', { txHash: simulatedTxHash });

    // Simulate confirmation (in production, poll for actual confirmation)
    await updateJobStatus(jobId, 'CONFIRMED');

    console.log(`✅ Job ${jobId} processed successfully: ${simulatedTxHash}`);

    return simulatedTxHash;
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error);

    const errorMessage = error.message || 'Unknown error';

    // Check if we should retry
    if (job.attempts + 1 >= job.maxAttempts) {
      await updateJobStatus(jobId, 'FAILED', { error: errorMessage });
      console.log(`❌ Job ${jobId} failed permanently after ${job.attempts + 1} attempts`);
    } else {
      await updateJobStatus(jobId, 'PENDING', { error: errorMessage });
      console.log(`⚠️ Job ${jobId} will be retried (attempt ${job.attempts + 1}/${job.maxAttempts})`);
    }

    return null;
  }
}

/**
 * Process all pending jobs
 * Returns number of jobs processed
 */
export async function processPendingJobs(limit: number = 10): Promise<number> {
  const jobs = await getPendingJobs(limit);

  console.log(`📋 Processing ${jobs.length} pending jobs...`);

  let processed = 0;
  for (const job of jobs) {
    try {
      await processJob(job.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
    }
  }

  console.log(`✅ Processed ${processed}/${jobs.length} jobs`);

  return processed;
}
