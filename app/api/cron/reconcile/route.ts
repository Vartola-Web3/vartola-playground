import { NextRequest, NextResponse } from 'next/server';
import { isAlphaMode } from '@/lib/config/app-mode';
import { runReconciliation } from '@/lib/alpha/reconcile-runner';
import { indexSorobanEvents } from '@/lib/stellar/indexer';
import { purgeExpired } from '@/lib/sandbox/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Scheduled worker: purge expired sandbox sessions (every mode), then re-index chain events and reconcile
// (Alpha only). Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sandboxPurged = await purgeExpired().catch(() => 0);
  if (!isAlphaMode()) return NextResponse.json({ status: 'NOT_APPLICABLE', message: 'Runs in Alpha mode only', sandboxPurged });
  const indexed = await indexSorobanEvents().then((result) => ({ ok: true as const, ...result })).catch((error) => ({ ok: false as const, error: error instanceof Error ? error.message : 'index failed' }));
  const reconciliation = await runReconciliation('SCHEDULED');
  return NextResponse.json({ indexed, reconciliation: reconciliation.record, sandboxPurged });
}
