'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { countsFromAssetTypes, fleetImage, getFleetVisualType } from '@/lib/fleet-visual';

const tabs = ['Overview', 'Businesses', 'Vehicles', 'Risk', 'Payment model', 'Documents', 'Advanced'];
const money = (value: unknown) => new Intl.NumberFormat('en-AE', {
  style: 'currency', currency: 'AED', maximumFractionDigits: 0,
}).format(Number(value) || 0);

export default function OpportunityPage() {
  const params = useParams<{ poolId: string }>();
  const { data: session } = useSession();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetch(`/api/marketplace/pools/${encodeURIComponent(params.poolId)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load this opportunity.');
        return data;
      })
      .then((data) => {
        if (active) setItem(data.pool || null);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [params.poolId]);

  if (loading) return <main className="vartola-grid-light min-h-screen text-[#62736C]"><div className="vartola-frame py-8">Loading opportunity…</div></main>;
  if (error || !item) {
    return (
      <main className="vartola-grid-light min-h-screen text-[#13251E]"><div className="vartola-frame py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E4ECE8] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Opportunity unavailable</h1>
          <p className="mt-2 text-sm text-[#62736C]">{error || 'This opportunity could not be found.'}</p>
          <Link href="/marketplace" className="mt-5 inline-flex rounded-full bg-[#0D7A52] px-4 py-2 text-sm font-semibold text-white">
            Back to opportunities
          </Link>
        </div>
      </main>
    );
  }
  const name = String(item.poolName).replace(/ Pool/g, '');
  const funded = Number(item.targetAmount) ? Math.round((Number(item.raisedAmount) / Number(item.targetAmount)) * 100) : 0;

  const vehicles = ((item.vehicles as unknown) as { type?: string }[]) || [];
  const image = fleetImage(getFleetVisualType(countsFromAssetTypes(vehicles.map((vehicle) => vehicle.type || ''))));
  const content = (
      <div className="w-full">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-medium text-[#0D4D35]">← All opportunities</Link>
        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <img src={image} alt="" className="h-56 w-full rounded-[20px] object-cover lg:h-64" />
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#0D7A52]">{String(item.assetFocus)}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">{name}</h1>
                <p className="mt-2 max-w-3xl text-[#62736C]">{String(item.description || 'Fleet investment supporting UAE logistics operators.')}</p>
              </div>
              <span className="rounded-full bg-[#EAF9F1] px-3 py-1.5 text-sm font-semibold text-[#0A4934]">
                {String(item.status).replaceAll('_', ' ')}
              </span>
            </div>
            <section className="mt-5 rounded-[20px] border border-[#E4ECE8] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">On-chain references</h2>
              <p className="mt-1 text-sm text-[#62736C]">Every confirmed operation on this opportunity has a public Stellar Testnet link.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {(((item.references as unknown) as { id: string; label: string; amount: number | null; at: string; reviewUrl: string }[]) || []).map((reference) => (
                  <li key={reference.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#F7FAF8] px-3 py-2">
                    <span>{reference.label}{reference.amount != null ? ` · ${money(reference.amount)}` : ''} · {new Date(reference.at).toLocaleDateString()}</span>
                    <a className="font-medium text-[#0A4934] underline" href={reference.reviewUrl} target="_blank" rel="noreferrer">Stellar reference</a>
                  </li>
                ))}
                {(!Array.isArray(item.references) || item.references.length === 0) && (
                  <li className="text-[#62736C]">No confirmed Stellar reference yet.</li>
                )}
              </ul>
            </section>
            <div className="mt-5 flex flex-wrap gap-2 border-b border-[#E4ECE8] pb-4">
              {tabs.map((label) => (
                <button key={label} type="button" onClick={() => setTab(label)} className={`rounded-full px-3 py-1.5 text-sm ${tab === label ? 'bg-[#0D7A52] text-white' : 'border border-[#E4ECE8] bg-white text-[#62736C]'}`}>
                  {label}
                </button>
              ))}
            </div>
            <section className="mt-4 min-h-52 rounded-[20px] border border-[#E4ECE8] bg-white p-5 shadow-sm lg:p-6">
              <h2 className="mb-5 text-lg font-semibold">{tab}</h2>
              {tab === 'Overview' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  {[
                    ['Investment size', money(item.targetAmount)],
                    ['Available to invest', money(item.available)],
                    ['Minimum', money(item.minInvestment)],
                    ['Term', `${String(item.termMonths || '—')} months`],
                    ['Investment risk', `${String(item.riskRating)} · ${String(item.riskScore)}/100`],
                    ['Indicative yield', `${String(item.indicativeYield)}%`],
                    ['Vehicles', String(item.unitCount || item.assets)],
                    ['Businesses', String(item.companies)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-[#F7FAF8] p-4">
                      <p className="text-[#62736C]">{label}</p>
                      <p className="mt-1 text-base font-semibold text-[#13251E]">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Businesses' && (
                <ul className="grid gap-3 sm:grid-cols-2 text-sm">
                  {(((item.businesses as unknown) as { name: string; industry: string; emirate?: string; score: number | null; tier: string | null }[]) || []).map((company) => (
                    <li key={company.name} className="rounded-2xl bg-[#F7FAF8] p-4">
                      <p className="font-semibold">{company.name}</p>
                      <p className="mt-1 text-[#62736C]">{company.industry}{company.emirate ? ` · ${company.emirate}` : ''}</p>
                      <p className="mt-3 text-xs text-[#62736C]">Risk score {company.score ?? '—'} · {company.tier || 'Unrated'}</p>
                    </li>
                  ))}
                </ul>
              )}
              {tab === 'Vehicles' && (
                <ul className="grid gap-3 sm:grid-cols-2 text-sm">
                  {(((item.vehicles as unknown) as { no: string; description: string; units?: number; value?: number; financeAmount: number; status: string }[]) || []).map((vehicle) => (
                    <li key={vehicle.no} className="rounded-2xl bg-[#F7FAF8] p-4">
                      <p className="font-semibold">{vehicle.description}</p>
                      <p className="mt-1 text-[#62736C]">{vehicle.units || 1} units · Asset value {money(vehicle.value)}</p>
                      <p className="mt-3 text-xs text-[#62736C]">{vehicle.no} · Finance {money(vehicle.financeAmount)} · {vehicle.status.replaceAll('_', ' ')}</p>
                    </li>
                  ))}
                </ul>
              )}
              {tab === 'Risk' && <p className="max-w-3xl text-sm leading-7 text-[#62736C]">Vartola rating {String(item.riskRating)} ({String(item.riskScore)}/100) blends company quality, vehicle liquidity, diversification, SME contribution, and concentration. It is an internal simulation rating, not an external credit rating.</p>}
              {tab === 'Payment model' && <p className="max-w-3xl text-sm leading-7 text-[#62736C]">Investor capital stays reserved while the opportunity is funding. Once fully funded, it is deployed to the linked facility. The SME then pays scheduled monthly instalments and principal plus income are distributed proportionally to participating investors.</p>}
              {tab === 'Documents' && <p className="max-w-3xl text-sm leading-7 text-[#62736C]">The demo includes the opportunity summary, asset and company assessment, risk method, and simulation disclaimer. Confidential identity and company documents remain restricted to authorised reviewers.</p>}
              {tab === 'Advanced' && (
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  {[
                    ['Structure reference', String(item.poolNo || item.id)],
                    ['Financing facilities', String(item.facilities)],
                    ['Funding queue', 'Enabled'],
                    ['Incomplete funding policy', String(item.incompletePolicy).replaceAll('_', ' ')],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-[#F7FAF8] p-4">
                      <dt className="text-[#62736C]">{label}</dt><dd className="mt-1 font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          </div>

          <aside className="rounded-[20px] border border-[#DCE6E1] bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm text-[#62736C]">Investment summary</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[#62736C]">Target return</p><p className="mt-1 text-2xl font-semibold">{String(item.indicativeYield)}%</p></div>
              <div><p className="text-xs text-[#62736C]">Term</p><p className="mt-1 text-2xl font-semibold">{String(item.termMonths || '—')} <span className="text-sm font-normal">mo</span></p></div>
            </div>
            <div className="mt-5 border-t border-[#E4ECE8] pt-5">
              <div className="flex justify-between text-sm"><span className="text-[#62736C]">Funded</span><span className="font-semibold">{funded}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ECFBF3]"><div className="h-full bg-[#17C978]" style={{ width: `${Math.min(100, funded)}%` }} /></div>
              <div className="mt-4 flex justify-between text-sm"><span className="text-[#62736C]">Available</span><span className="font-semibold">{money(item.available)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span className="text-[#62736C]">Minimum</span><span className="font-semibold">{money(item.minInvestment)}</span></div>
            </div>
            {Number(item.available) >= Number(item.minInvestment) ? (
              <Link href={`/marketplace?invest=${String(item.id)}`} className="mt-6 flex w-full justify-center rounded-full bg-[#15C77A] px-4 py-3 text-sm font-semibold text-white">Invest in this opportunity</Link>
            ) : (
              <p className="mt-6 rounded-xl bg-[#F1F5F3] px-4 py-3 text-center text-sm font-semibold text-[#62736C]">Fully funded</p>
            )}
            <p className="mt-3 text-center text-xs leading-5 text-[#7A8983]">Simulation only · Virtual tAED · No real value</p>
          </aside>
        </div>
      </div>
  );

  if (session?.user?.role === 'INVESTOR' || session?.user?.role === 'ADMIN') {
    return <DashboardLayout role={session.user.role}>{content}</DashboardLayout>;
  }
  return <main className="vartola-grid-light min-h-screen text-[#13251E]"><div className="vartola-frame py-8">{content}</div></main>;
}
