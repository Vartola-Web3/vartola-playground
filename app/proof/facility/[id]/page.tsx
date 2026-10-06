import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { contractUrl } from '@/lib/docs/testnet';
import { facilityLifecycle } from '@/lib/docs/proof';

export const dynamic = 'force-dynamic';

export default async function ProofFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = facilityLifecycle(decodeURIComponent(id));
  if (!view) notFound();
  const { facility, contractId, stages } = view;
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Reference facility proof · Stellar Testnet</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{facility.facilityNo}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            {facility.financeAmount.toLocaleString('en-US')} VTAED · {facility.participationUnits} Participation Units · final state {facility.status}. Every row is a real Testnet transaction. Open it on the Stellar explorer to see the ledger close time and the contract invocation.
          </p>
          <p className="mt-2 text-xs text-[#9FB8AD]">Facility contract <a className="break-all text-[#70FFB8] underline underline-offset-4" href={contractUrl(contractId)} target="_blank" rel="noreferrer">{contractId}</a> · <Link className="text-[#70FFB8] underline underline-offset-4" href={`/verify/facility/${facility.facilityNo}`}>live contract verification</Link></p>
        </header>
        <ol className="space-y-4">
          {stages.map((stage, index) => (
            <li key={stage.key} className={`rounded-[24px] border p-5 ${stage.reached ? 'border-[rgba(112,255,184,0.3)] bg-[#091713]' : 'border-white/10 bg-[#0A1613] opacity-60'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold"><span className="mr-2 text-[#70FFB8]">{index + 1}.</span>{stage.label}</h2>
                <span className="text-xs text-[#9FB8AD]">{stage.reached ? `${stage.events.length} event${stage.events.length === 1 ? '' : 's'}` : 'Not part of this facility’s path'}</span>
              </div>
              <p className="mt-1 text-xs text-[#9FB8AD]">Financial effect: {stage.effect}</p>
              {stage.events.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-xs">
                    <thead><tr className="text-[#9FB8AD]"><th className="py-1 pr-3 font-medium">Event</th><th className="py-1 pr-3 font-medium">Ledger</th><th className="py-1 font-medium">Transaction</th></tr></thead>
                    <tbody>
                      {stage.events.map((event, i) => (
                        <tr key={`${event.txHash}-${i}`} className="border-t border-white/10">
                          <td className="py-1.5 pr-3">{event.eventType.replace('FacilityStatus:', 'Status: ')}</td>
                          <td className="py-1.5 pr-3">{event.ledger}</td>
                          <td className="break-all py-1.5"><a className="text-[#70FFB8] underline underline-offset-4" href={event.explorerUrl} target="_blank" rel="noreferrer">View on Stellar Explorer</a> <span className="text-[#9FB8AD]">{event.txHash.slice(0, 16)}…</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="text-xs text-[#9FB8AD]">Reference run on Stellar Testnet with test wallets. VTAED has no monetary value. Not audited, not a regulated product, not a customer facility.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
