import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { facilityProof } from '@/lib/alpha/verify';

export const dynamic = 'force-dynamic';

export default async function VerifyFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proof = await facilityProof(decodeURIComponent(id));
  if (!proof) notFound();
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Facility verification · {proof.network}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{proof.facilityNo}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            This page reads the facility directly from the Soroban contract and lists the confirmed transactions behind it. {proof.note}
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Lifecycle state', proof.lifecycleState.replaceAll('_', ' ')],
            ['Funding', `${proof.fundingPercent}%`],
            ['Participation Units', String(proof.totalUnits)],
            ['Principal outstanding', proof.principalOutstanding === null ? 'Unavailable' : `${proof.principalOutstanding.toLocaleString('en-US')} VTAED`],
            ['Document attestations', String(proof.documentAttestations)],
            ['Asset attestations', String(proof.assetAttestations)],
            ['Risk grade', proof.risk ? `${proof.risk.grade} (${proof.risk.score}) · ${proof.risk.modelVersion}` : 'Not scored'],
            ['Risk attested on-chain', proof.events.some((event) => event.eventType === 'RiskAttested') ? 'Yes' : 'No'],
            ['Chain read', proof.chainRead === 'LIVE' ? 'Live from contract' : 'Contract read unavailable'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4">
              <p className="text-xs text-[#70FFB8]">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </section>

        {proof.risk ? (
          <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6">
            <h2 className="text-xl font-semibold">Risk grade {proof.risk.grade} · score {proof.risk.score}</h2>
            <p className="mt-2 text-xs text-[#9FB8AD]">{proof.risk.notice}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-[#C3D1CB]">
              <div><p className="font-semibold text-[#F6FFF9]">What improves the score</p><ul className="mt-1 list-disc space-y-1 pl-5">{proof.risk.improves.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><p className="font-semibold text-[#F6FFF9]">What increases the risk</p><ul className="mt-1 list-disc space-y-1 pl-5">{proof.risk.increases.length ? proof.risk.increases.map((item) => <li key={item}>{item}</li>) : <li>Nothing currently holds the score down.</li>}</ul></div>
            </div>
          </section>
        ) : null}

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6">
          <h2 className="text-xl font-semibold">Contract and asset</h2>
          <p className="mt-3 break-all text-sm text-[#9FB8AD]">Facility contract: <a className="text-[#70FFB8] underline underline-offset-4" href={`https://stellar.expert/explorer/testnet/contract/${proof.contractId}`}>{proof.contractId}</a></p>
          <p className="mt-1 text-sm text-[#9FB8AD]">Asset: {proof.asset} (Vartola Test AED, non-redeemable)</p>
        </section>

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6">
          <h2 className="text-xl font-semibold">On-chain transaction references</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-xs">
              <tbody>
                {proof.events.map((event) => (
                  <tr key={event.transactionHash + event.eventType} className="border-t border-white/10">
                    <th className="w-[28%] py-2 pr-3 font-medium text-[#D7E7DF]">{event.eventType}</th>
                    <td className="py-2 pr-3">ledger {event.ledger}</td>
                    <td className="break-all py-2"><a className="text-[#70FFB8] underline underline-offset-4" href={event.explorerUrl}>{event.transactionHash}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-sm text-[#9FB8AD]">Not shown here: SME details, identity data, bank details, wallet addresses of investors, and private documents. <Link href="/technical" className="text-[#70FFB8] underline underline-offset-4">Technical architecture</Link></p>
      </main>
      <SiteFooter />
    </div>
  );
}
