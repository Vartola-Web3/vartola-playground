import { prisma } from '@/lib/db';
import { facilityContractId, registryContractId } from '@/lib/stellar/keys';
import { sorobanServer } from '@/lib/stellar/soroban/call';
import { getIndexerState, getLastReconciliation, indexerHealth } from '@/lib/alpha/ops-state';
import { VTAED } from '@/lib/docs/product';
import { TESTNET } from '@/lib/docs/testnet';

const tone: Record<string, string> = {
  HEALTHY: 'bg-emerald-100 text-emerald-900',
  WARNING: 'bg-amber-100 text-amber-900',
  DEGRADED: 'bg-amber-100 text-amber-900',
  FAILED: 'bg-red-100 text-red-900',
  DOWN: 'bg-red-100 text-red-900',
  NOT_STARTED: 'bg-slate-100 text-slate-700',
  'NOT RUN': 'bg-slate-100 text-slate-700',
};

// Web3 transparency for operators: the essentials first, the long identifiers under Advanced.
export async function TransparencyPanel() {
  const [ledger, lastEvent, indexer, recon] = await Promise.all([
    sorobanServer().getLatestLedger().then((row) => row.sequence).catch(() => null),
    prisma.chainEvent.findFirst({ orderBy: { createdAt: 'desc' } }),
    getIndexerState(),
    getLastReconciliation(),
  ]);
  const health = indexerHealth(indexer);
  const reconStatus = recon?.status || 'NOT RUN';
  const facility = facilityContractId();
  const registry = registryContractId();
  return (
    <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Stellar Testnet transparency</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#F6F9F7] p-3"><dt className="text-xs text-[#708078]">Asset</dt><dd className="font-semibold">VTAED · no monetary value</dd></div>
        <div className="rounded-2xl bg-[#F6F9F7] p-3"><dt className="text-xs text-[#708078]">Current ledger</dt><dd className="font-semibold">{ledger ?? 'unavailable'}</dd></div>
        <div className="rounded-2xl bg-[#F6F9F7] p-3"><dt className="text-xs text-[#708078]">Last chain event</dt><dd className="font-semibold">{lastEvent ? `${lastEvent.eventType} · ledger ${lastEvent.ledger}` : 'none yet'}</dd></div>
        <div className="rounded-2xl bg-[#F6F9F7] p-3"><dt className="text-xs text-[#708078]">Health</dt><dd className="mt-1 flex flex-wrap gap-2 text-xs font-semibold"><span className={`rounded-full px-2 py-0.5 ${tone[health]}`}>Indexer {health}</span><span className={`rounded-full px-2 py-0.5 ${tone[reconStatus]}`}>Reconciliation {reconStatus}</span></dd></div>
      </dl>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-[#0D7A52]">Advanced blockchain details</summary>
        <dl className="mt-3 space-y-2 break-all text-xs text-[#52635C]">
          <div><dt className="font-semibold">VTAED issuer</dt><dd><a className="text-[#0D7A52] underline" href={VTAED.assetUrl}>{VTAED.issuer}</a></dd></div>
          <div><dt className="font-semibold">VTAED Stellar Asset Contract</dt><dd>{TESTNET.deployment.asset.contractId}</dd></div>
          <div><dt className="font-semibold">Wallet registry</dt><dd>{registry || 'not configured'}</dd></div>
          <div><dt className="font-semibold">Facility contract</dt><dd>{facility || 'not configured'}</dd></div>
          <div><dt className="font-semibold">Indexer</dt><dd>last indexed ledger {indexer.lastIndexedLedger || '—'} · pending retries {indexer.pendingRetries} · {indexer.totalIndexed} events indexed</dd></div>
          <div><dt className="font-semibold">Reconciliation</dt><dd>{recon ? `${recon.code} · ${new Date(recon.checkedAt).toLocaleString('en-GB')} · ${recon.trigger.toLowerCase()}` : 'not run yet'}</dd></div>
        </dl>
      </details>
    </section>
  );
}
