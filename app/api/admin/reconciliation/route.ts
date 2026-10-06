import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { isAlphaMode } from '@/lib/config/app-mode';
import { runReconciliation } from '@/lib/alpha/reconcile-runner';
import { clearDeadLetters, getDeadLetters, getIndexerState, getLastReconciliation, indexerHealth } from '@/lib/alpha/ops-state';
import { indexSorobanEvents } from '@/lib/stellar/indexer';
import { sorobanServer } from '@/lib/stellar/soroban/call';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return null;
  return session.user;
}

async function overview() {
  const [indexer, deadLetters, last, ledger] = await Promise.all([
    getIndexerState(),
    getDeadLetters(),
    getLastReconciliation(),
    sorobanServer().getLatestLedger().then((row) => row.sequence).catch(() => null),
  ]);
  return { indexer: { ...indexer, health: indexerHealth(indexer) }, deadLetters: deadLetters.slice(0, 10), lastReconciliation: last, currentLedger: ledger };
}

// Overview of indexer health and the last stored reconciliation. Reading does not run a new reconciliation.
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAlphaMode()) return NextResponse.json({ status: 'NOT_APPLICABLE', message: 'Reconciliation applies to Alpha mode, where Soroban is the financial source.' });
  return NextResponse.json(await overview());
}

// Manual operations. None of them can change chain history: `run` compares, `reindex` re-reads events,
// `clear-dead-letters` acknowledges failed events after they were reviewed.
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAlphaMode()) return NextResponse.json({ error: 'Alpha mode only' }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  try {
    if (body?.action === 'run') {
      const result = await runReconciliation('MANUAL', user.id);
      return NextResponse.json({ ...(await overview()), report: { status: result.status, findings: result.findings, checkedAt: result.checkedAt, facilities: result.facilities, contractId: result.contractId } });
    }
    if (body?.action === 'reindex') return NextResponse.json({ ...(await indexSorobanEvents()), ...(await overview()) });
    if (body?.action === 'clear-dead-letters') {
      await clearDeadLetters();
      return NextResponse.json(await overview());
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Operation failed' }, { status: 500 });
  }
}
