'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useApiResource } from '@/lib/hooks/use-api-resource';

type Finding = { severity: 'warning' | 'error'; code: string; message: string };
type Overview = {
  status?: string;
  message?: string;
  currentLedger: number | null;
  indexer: { health: string; lastIndexedLedger: number; latestEventAt: string | null; latestEventType: string | null; lastRunAt: string | null; consecutiveFailures: number; pendingRetries: number; lastError: string | null; totalIndexed: number };
  deadLetters: { at: string; stage: string; error: string; ref?: string }[];
  lastReconciliation: { code: string; status: string; checkedAt: string; facilities: number; findings: number; trigger: string } | null;
  report?: { status: string; findings: Finding[]; checkedAt: string; facilities: number };
};

const tone: Record<string, string> = {
  HEALTHY: 'bg-emerald-100 text-emerald-900',
  WARNING: 'bg-amber-100 text-amber-900',
  DEGRADED: 'bg-amber-100 text-amber-900',
  FAILED: 'bg-red-100 text-red-900',
  DOWN: 'bg-red-100 text-red-900',
  NOT_STARTED: 'bg-slate-100 text-slate-700',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-700',
};

export default function ReconciliationPage() {
  const { data: session } = useSession();
  const resource = useApiResource<Overview>('/api/admin/reconciliation');
  const [override, setOverride] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const overview = override ?? resource.data ?? null;

  const act = async (action: 'run' | 'reindex' | 'clear-dead-letters') => {
    setBusy(true);
    setNote('');
    try {
      const response = await fetch('/api/admin/reconciliation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await response.json();
      if (!response.ok) setNote(data.error || 'The operation failed');
      else {
        setOverride(data);
        if (action === 'reindex') setNote(`Re-indexed ${data.stored} event(s), ${data.failed} failed.`);
      }
    } finally {
      setBusy(false);
    }
  };

  const badge = (value: string) => <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone[value] || tone.FAILED}`}>{value}</span>;

  return (
    <DashboardLayout role={session?.user?.role || 'ADMIN'}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Reconciliation and indexer</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Soroban is the financial source; Prisma is the read model. A scheduled worker re-indexes chain events and reconciles every confirmed facility. Operations here only read the chain or acknowledge failures; none can rewrite chain history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => act('run')} disabled={busy} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Run reconciliation</button>
            <button type="button" onClick={() => act('reindex')} disabled={busy} className="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Re-index events</button>
          </div>
        </div>
        {note ? <p className="rounded-lg bg-slate-100 px-4 py-2 text-sm">{note}</p> : null}
        {resource.error ? <p className="text-sm text-red-700">{resource.error}</p> : null}
        {!overview ? <p className="text-sm text-slate-600">Loading…</p> : overview.status === 'NOT_APPLICABLE' ? <p className="text-sm text-slate-600">{overview.message}</p> : (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-semibold">Last reconciliation</h2>
                {overview.lastReconciliation ? (
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{badge(overview.lastReconciliation.status)} <span className="ml-2 text-xs text-slate-500">{overview.lastReconciliation.code}</span></p>
                    <p>{new Date(overview.lastReconciliation.checkedAt).toLocaleString('en-GB')} · {overview.lastReconciliation.trigger.toLowerCase()} · {overview.lastReconciliation.facilities} facilities · {overview.lastReconciliation.findings} finding(s)</p>
                  </div>
                ) : <p className="mt-2 text-sm text-slate-600">No reconciliation has run yet.</p>}
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-semibold">Indexer health</h2>
                <div className="mt-2 space-y-1 text-sm">
                  <p>{badge(overview.indexer.health)}</p>
                  <p>Last indexed ledger {overview.indexer.lastIndexedLedger || '—'} · current ledger {overview.currentLedger ?? '—'}</p>
                  <p>Latest event {overview.indexer.latestEventType || '—'} {overview.indexer.latestEventAt ? `at ${new Date(overview.indexer.latestEventAt).toLocaleString('en-GB')}` : ''}</p>
                  <p>Pending retries {overview.indexer.pendingRetries} · consecutive failures {overview.indexer.consecutiveFailures} · indexed {overview.indexer.totalIndexed}</p>
                  {overview.indexer.lastError ? <p className="text-red-700">{overview.indexer.lastError}</p> : null}
                </div>
              </article>
            </section>
            {overview.report ? (
              overview.report.findings.length > 0 ? (
                <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {overview.report.findings.map((finding, index) => (
                    <li key={`${finding.code}-${index}`} className="flex flex-wrap items-start gap-3 px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${finding.severity === 'error' ? tone.FAILED : tone.WARNING}`}>{finding.code}</span>
                      <span className="min-w-0 flex-1">{finding.message}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-600">This run found nothing to report: status, funded amount, units, outstanding principal, and every investor position match the chain.</p>
            ) : null}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Failed events (dead letters)</h2>
                {overview.deadLetters.length > 0 ? <button type="button" onClick={() => act('clear-dead-letters')} disabled={busy} className="text-sm text-emerald-700 underline disabled:opacity-50">Acknowledge all</button> : null}
              </div>
              {overview.deadLetters.length === 0 ? <p className="mt-2 text-sm text-slate-600">None.</p> : (
                <ul className="mt-2 space-y-1 text-sm">
                  {overview.deadLetters.map((row, index) => <li key={index}>{new Date(row.at).toLocaleString('en-GB')} · {row.stage} · {row.error}</li>)}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
