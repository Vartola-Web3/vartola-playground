'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { countsFromAssetTypes, fleetImage, getFleetVisualType } from '@/lib/fleet-visual';

const tabs = ['Overview', 'Businesses', 'Vehicles', 'Risk', 'Payment model', 'Documents', 'Advanced'];

export default function OpportunityPage() {
  const params = useParams<{ poolId: string }>();
  const { data: session } = useSession();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [tab, setTab] = useState('Overview');

  useEffect(() => {
    fetch('/api/marketplace/pools')
      .then((response) => response.json())
      .then((data) => setItem((data.pools || []).find((row: { id: string }) => row.id === params.poolId) || null));
  }, [params.poolId]);

  if (!item) return <main className="min-h-screen bg-[#F7FAF8] p-8 text-[#62736C]">Loading opportunity…</main>;
  const name = String(item.poolName).replace(/ Pool/g, '');
  const funded = Number(item.targetAmount) ? Math.round((Number(item.raisedAmount) / Number(item.targetAmount)) * 100) : 0;

  const vehicles = ((item.vehicles as unknown) as { type?: string }[]) || [];
  const image = fleetImage(getFleetVisualType(countsFromAssetTypes(vehicles.map((vehicle) => vehicle.type || ''))));
  const content = (
      <div className="mx-auto max-w-4xl">
        <Link href="/marketplace" className="text-sm text-[#0D4D35]">All opportunities</Link>
        <img src={image} alt="" className="mt-4 h-64 w-full rounded-[20px] object-cover" />
        <h1 className="mt-5 text-4xl font-semibold">{name}</h1>
        <p className="mt-2 text-[#62736C]">{String(item.description || 'Fleet investment supporting UAE logistics operators.')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((label) => (
            <button key={label} type="button" onClick={() => setTab(label)} className={`rounded-full px-3 py-1.5 text-sm ${tab === label ? 'bg-[#17C978] text-white' : 'border border-[#E4ECE8] bg-white text-[#62736C]'}`}>
              {label}
            </button>
          ))}
        </div>
        <section className="mt-5 rounded-[20px] border border-[#E4ECE8] bg-white p-5 shadow-sm">
          {tab === 'Overview' && (
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <p><span className="block text-[#62736C]">Investment size</span>{Number(item.targetAmount).toLocaleString()} AED</p>
              <p><span className="block text-[#62736C]">Available to invest</span>{Number(item.available).toLocaleString()} AED</p>
              <p><span className="block text-[#62736C]">Minimum</span>{Number(item.minInvestment).toLocaleString()} AED</p>
              <p><span className="block text-[#62736C]">Term</span>{String(item.termMonths || '—')} months</p>
              <p><span className="block text-[#62736C]">Investment risk</span>{String(item.riskRating)} · {String(item.riskScore)}/100</p>
              <p><span className="block text-[#62736C]">Indicative yield</span>{String(item.indicativeYield)}%</p>
              <p><span className="block text-[#62736C]">Vehicles</span>{String(item.assets)}</p>
              <p><span className="block text-[#62736C]">Businesses</span>{String(item.companies)}</p>
              <div className="sm:col-span-3">
                <div className="h-2 overflow-hidden rounded-full bg-[#ECFBF3]"><div className="h-full bg-[#17C978]" style={{ width: `${funded}%` }} /></div>
                <p className="mt-1 text-[#62736C]">{funded}% funded</p>
              </div>
            </div>
          )}
          {tab === 'Businesses' && (
            <ul className="space-y-3 text-sm">
              {(((item.businesses as unknown) as { name: string; industry: string; score: number | null; tier: string | null }[]) || []).map((company) => (
                <li key={company.name} className="rounded-2xl bg-[#F7FAF8] p-3">
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-[#62736C]">{company.industry} · score {company.score ?? '—'} · {company.tier || 'unrated'}</p>
                </li>
              ))}
            </ul>
          )}
          {tab === 'Vehicles' && (
            <ul className="space-y-3 text-sm">
              {(((item.vehicles as unknown) as { no: string; description: string; financeAmount: number; status: string }[]) || []).map((vehicle) => (
                <li key={vehicle.no} className="rounded-2xl bg-[#F7FAF8] p-3">
                  <p className="font-semibold">{vehicle.description}</p>
                  <p className="text-[#62736C]">{vehicle.no} · {vehicle.financeAmount} AED · {vehicle.status}</p>
                </li>
              ))}
            </ul>
          )}
          {tab === 'Risk' && <p className="text-sm text-[#62736C]">AssetFi rating {String(item.riskRating)} ({String(item.riskScore)}/100) blends company quality, vehicle liquidity, diversification, contribution, and concentration. It is not an external credit rating.</p>}
          {tab === 'Payment model' && <p className="text-sm text-[#62736C]">Lease income is indicative. Capital stays reserved until vehicles are deployed, then income follows the facilities you were allocated to.</p>}
          {tab === 'Documents' && <p className="text-sm text-[#62736C]">Opportunity summary, risk method, and testnet disclaimer. Confidential company files are not shared here.</p>}
          {tab === 'Advanced' && <p className="text-sm text-[#62736C]">Structure reference {String(item.poolNo || item.id)}. Financing facilities: {String(item.facilities)}. Funding queue is enabled. Incomplete funding policy: {String(item.incompletePolicy)}.</p>}
        </section>
      </div>
  );

  if (session?.user?.role === 'INVESTOR' || session?.user?.role === 'ADMIN') {
    return <DashboardLayout role={session.user.role}>{content}</DashboardLayout>;
  }
  return <main className="min-h-screen bg-[#F7FAF8] px-4 py-8 text-[#13251E] sm:px-6">{content}</main>;
}
