import { prisma } from '@/lib/db';
import { logger } from '@/lib/ops/logger';

export type HealthCheck = 'ok' | 'error';
export type HealthReport = {
  status: 'ok' | 'degraded';
  time: string;
  checks: { database: HealthCheck };
};

// Readiness probe: the process can serve traffic and the database answers. It exposes no secrets and no
// private data, so it is safe to keep public for monitoring.
export async function healthReport(): Promise<HealthReport> {
  let database: HealthCheck = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = 'error';
    // The public report stays free of details. Operators get a redacted reason in the logs.
    const detail = error instanceof Error ? error.message : 'unknown error';
    logger.error('database health check failed', {
      detail: detail.replace(/postgres(ql)?:\/\/\S+/gi, '[redacted]').slice(0, 300),
    });
  }
  return {
    status: database === 'ok' ? 'ok' : 'degraded',
    time: new Date().toISOString(),
    checks: { database },
  };
}
