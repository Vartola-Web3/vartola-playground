import { AdminPage, Badge, Card, Stat, Table, statusTone } from '@/components/ops/ui';
import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { getDeadLetters, getIndexerState, getLastReconciliation, indexerHealth } from '@/lib/alpha/ops-state';
import { hoursAgo } from '@/lib/ops/time';
import { sorobanServer } from '@/lib/stellar/soroban/call';

export const dynamic = 'force-dynamic';

async function safe<T>(work: () => Promise<T>, fallback: T) {
  try {
    return await work();
  } catch {
    return fallback;
  }
}

export default async function OperationsHealthPage() {
  const since = hoursAgo(24);
  const [indexer, dead, last, ledger, txOk, txFail, adminFails, pauseEvents, privileged, kyc, wallets] = await Promise.all([
    safe(getIndexerState, null),
    safe(getDeadLetters, []),
    safe(getLastReconciliation, null),
    safe(() => sorobanServer().getLatestLedger().then((row) => row.sequence), null as number | null),
    safe(() => prisma.stellarTransaction.count({ where: { status: 'CONFIRMED', createdAt: { gte: since } } }), 0),
    safe(() => prisma.stellarTransaction.count({ where: { status: 'FAILED', createdAt: { gte: since } } }), 0),
    safe(() => prisma.auditLog.count({ where: { action: { contains: 'LOGIN_FAILED' }, createdAt: { gte: since } } }), 0),
    safe(() => prisma.chainEvent.count({ where: { eventType: { contains: 'Pause' } } }), 0),
    safe(() => prisma.auditLog.count({ where: { OR: [{ action: { contains: 'RELEASE' } }, { action: { contains: 'ROLE' } }, { action: { contains: 'OPS_RECORD' } }], createdAt: { gte: since } } }), 0),
    safe(() => prisma.complianceCase.count({ where: { status: { in: ['PENDING', 'IN_REVIEW', 'REVIEW'] } } }), 0),
    safe(() => prisma.userWallet.count(), 0),
  ]);
  const health = indexer ? indexerHealth(indexer) : 'NOT_STARTED';
  const lag = ledger && indexer?.lastIndexedLedger ? Math.max(0, ledger - indexer.lastIndexedLedger) : null;
  const env = (name: string) => (process.env[name] ? 'CONFIGURED' : 'NOT CONFIGURED');
  const providers: [string, string][] = [
    ['KYC provider (Sumsub)', env('SUMSUB_TEST_APP_TOKEN') === 'CONFIGURED' || env('SUMSUB_APP_TOKEN') === 'CONFIGURED' ? 'CONFIGURED' : 'NOT CONFIGURED'],
    ['Private storage', env('STORAGE_BUCKET') === 'CONFIGURED' || env('S3_BUCKET') === 'CONFIGURED' ? 'CONFIGURED' : 'NOT CONFIGURED'],
    ['Email', env('SMTP_HOST') === 'CONFIGURED' || env('RESEND_API_KEY') === 'CONFIGURED' ? 'CONFIGURED' : 'NOT CONFIGURED'],
    ['SMS', env('TWILIO_ACCOUNT_SID') === 'CONFIGURED' ? 'CONFIGURED' : 'NOT CONFIGURED'],
    ['Payment adapter', 'SIMULATED (no real payment rail)'],
  ];
  return (
    <AdminPage title="Operations health" intro={`Mode ${isAlphaMode() ? 'ALPHA' : 'DEMO'}. Counts cover the last 24 hours unless stated. Provider status shows only whether a credential is configured, never the credential.`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Stellar and Soroban">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Latest ledger (RPC)" value={ledger ?? 'RPC unreachable'} hint={ledger ? 'RPC reachable' : 'Check STELLAR_SOROBAN_RPC_URL'} />
            <Stat label="Transactions confirmed / failed" value={`${txOk} / ${txFail}`} />
          </div>
        </Card>
        <Card title="Indexer">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Health" value={<Badge tone={statusTone(health)}>{health}</Badge>} />
            <Stat label="Last processed ledger" value={indexer?.lastIndexedLedger || 0} hint={lag !== null ? `${lag} ledgers behind` : undefined} />
            <Stat label="Retry queue" value={indexer?.pendingRetries ?? 0} />
            <Stat label="Dead letters" value={dead.length} />
          </div>
        </Card>
        <Card title="Reconciliation">
          {last ? <p><Badge tone={statusTone(last.status)}>{last.status}</Badge> {last.facilities} facilities, {last.findings} findings, {new Date(last.checkedAt).toLocaleString()} ({last.trigger})</p> : <p className="text-slate-500">No reconciliation has run yet.</p>}
        </Card>
        <Card title="Providers">
          <Table head={['Provider', 'Status']} rows={providers.map(([name, status]) => [name, <Badge key={name} tone={status.startsWith('CONFIGURED') ? 'good' : 'neutral'}>{status}</Badge>])} />
        </Card>
        <Card title="Platform">
          <p>Wallets provisioned: {wallets}. Open compliance reviews: {kyc}. API error counts, webhook delivery and background-job history need an external log sink; use Vercel logs until one is connected.</p>
        </Card>
        <Card title="Security">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Failed admin authentications" value={adminFails} />
            <Stat label="Privileged actions" value={privileged} />
            <Stat label="Pause events (all time)" value={pauseEvents} />
          </div>
        </Card>
      </div>
      {dead.length ? <Card title="Latest dead letters"><Table head={['When', 'Stage', 'Error']} rows={dead.slice(0, 5).map((row) => [new Date(row.at).toLocaleString(), row.stage, row.error])} /></Card> : null}
    </AdminPage>
  );
}
