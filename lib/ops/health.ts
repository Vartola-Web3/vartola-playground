import { prisma } from '@/lib/db';

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
  } catch {
    database = 'error';
  }
  return {
    status: database === 'ok' ? 'ok' : 'degraded',
    time: new Date().toISOString(),
    checks: { database },
  };
}
