import { NextResponse } from 'next/server';
import { healthReport } from '@/lib/ops/health';
import { logger } from '@/lib/ops/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const report = await healthReport();
  if (report.status !== 'ok') {
    logger.warn('health degraded', { checks: report.checks });
  }
  return NextResponse.json(report, { status: report.status === 'ok' ? 200 : 503 });
}
