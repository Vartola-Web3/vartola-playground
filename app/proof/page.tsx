import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { TESTNET, contractUrl, accountUrl } from '@/lib/docs/testnet';
import { QUALITY_STATUS } from '@/lib/docs/quality-status';
import { getIndexerState, getLastReconciliation, indexerHealth } from '@/lib/alpha/ops-state';
import { sorobanServer } from '@/lib/stellar/soroban/call';

export const metadata: Metadata = { title: 'Proof Center | Vartola', description: 'Verify Vartola on Stellar Testnet: contracts, asset, reference facilities, indexer and reconciliation health.' };
export const dynamic = 'force-dynamic';

async function ledger() {
  try {
    return await Promise.race([sorobanServer().getLatestLedger().then((row) => row.sequence), new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))]);
  } catch {
    return null;
  }
}

const card = 'rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4';
const panel = 'rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6';
const link = 'break-all text-[#70FFB8] underline underline-offset-4';

export default async function ProofPage() {
  const d = TESTNET.deployment;
  const [latest, indexer, reconciliation] = await Promise.all([ledger(), getIndexerState().catch(() => null), getLastReconciliation().catch(() => null)]);
  const health = indexer ? indexerHealth(indexer) : 'NOT_STARTED';
  const q = QUALITY_STATUS;
  const contracts: [string, string, string][] = [
    ['Stellar Asset Contract (VTAED)', d.asset.contractId, 'Wraps the VTAED classic asset for Soroban'],
    ['Wallet Registry', d.registryContractId, `v${d.contractVersion ?? 3}`],
    ['Facility Contract', d.facilityContractId, `v${d.contractVersion ?? 3}`],
  ];
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Proof Center · Stellar Testnet</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Verify it yourself</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            Everything on this page is a real Testnet record or a live read. Nothing here is a mock-up. The asset has no monetary value, nothing has been independently audited and no regulatory approval is claimed.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Network', 'Stellar Testnet'],
            ['Asset', `${d.asset.code} · test asset only`],
            ['Latest ledger (live RPC)', latest ? String(latest) : 'RPC unreachable right now'],
            ['Contract version', `v${d.contractVersion ?? 3} (deployed)`],
            ['Indexer health', health.replaceAll('_', ' ')],
            ['Last indexed ledger', indexer?.lastIndexedLedger ? String(indexer.lastIndexedLedger) : 'Not running on this deployment'],
            ['Reconciliation', reconciliation ? `${reconciliation.status} · ${new Date(reconciliation.checkedAt).toLocaleString('en-GB')}` : 'Not run on this deployment'],
            ['Recorded facilities', String(TESTNET.facilities.length)],
          ].map(([label, value]) => (
            <div key={label} className={card}><p className="text-xs text-[#70FFB8]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>
          ))}
        </section>
        <p className="text-xs text-[#9FB8AD]">
          The public website runs Demo mode, so the indexer and reconciliation on this deployment are not running. The Alpha environment ran them against these same contracts; its recorded result was HEALTHY for all three reference facilities.
        </p>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Smart contract infrastructure</h2>
          <div className="mt-4 space-y-3 text-sm">
            {contracts.map(([name, id, note]) => (
              <div key={name} className={card}><p className="font-medium">{name} <span className="text-xs text-[#9FB8AD]">· {note}</span></p><a className={`${link} text-xs`} href={contractUrl(id)} target="_blank" rel="noreferrer">{id}</a></div>
            ))}
            <div className={card}><p className="font-medium">VTAED issuer <span className="text-xs text-[#9FB8AD]">· Vartola Test AED, not redeemable</span></p><a className={`${link} text-xs`} href={accountUrl(d.asset.issuer)} target="_blank" rel="noreferrer">{d.asset.issuer}</a></div>
          </div>
          {d.history?.length ? <p className="mt-4 text-xs text-[#9FB8AD]">Superseded and never used: {d.history.map((row) => `${row.version} (${row.facilityContractId.slice(0, 8)}…)`).join(', ')}.</p> : null}
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Reference facilities on Testnet</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TESTNET.facilities.map((facility) => (
              <Link key={facility.facilityNo} href={`/proof/facility/${facility.facilityNo}`} className={`${card} block hover:border-[#70FFB8]`}>
                <p className="font-semibold">{facility.facilityNo}</p>
                <p className="mt-1 text-xs text-[#9FB8AD]">{facility.financeAmount.toLocaleString('en-US')} VTAED · {facility.participationUnits} units · {facility.status}</p>
                <p className="mt-2 text-xs text-[#70FFB8]">{facility.events.length} on-chain events →</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Engineering evidence</h2>
          <p className="mt-2 text-xs text-[#9FB8AD]">Recorded on {q.recordedOn} from the commands shown. These are not live counters.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Application tests', `${q.applicationTests.passed} passed, ${q.applicationTests.failed} failed`, q.applicationTests.command],
              ['Contract tests', `${q.contractTests.passed} passed, ${q.contractTests.failed} failed`, q.contractTests.command],
              ['Lint errors', String(q.lintErrors), q.lintCommand],
              ['Build', q.build, q.buildCommand],
            ].map(([label, value, command]) => (
              <div key={label} className={card}><p className="text-xs text-[#70FFB8]">{label}</p><p className="mt-1 font-semibold">{value}</p><p className="mt-1 font-mono text-[11px] text-[#9FB8AD]">{command}</p></div>
            ))}
          </div>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">What this does not prove</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-[#C3D1CB]">
            <li>No real money, no Mainnet deployment, no licence or regulatory approval.</li>
            <li>No independent smart-contract audit or penetration test. An audit readiness package is prepared.</li>
            <li>Facilities are reference runs executed by Vartola with test wallets, not customer facilities.</li>
            <li>Chain proof shows what happened on Testnet. It does not prove legal enforceability or asset title.</li>
          </ul>
          <p className="mt-4 text-sm"><Link className="text-[#70FFB8] underline underline-offset-4" href="/grant/reviewer">Reviewer overview</Link> · <Link className="text-[#70FFB8] underline underline-offset-4" href="/technical">Technical record</Link> · <Link className="text-[#70FFB8] underline underline-offset-4" href="/sandbox">Partner sandbox</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
