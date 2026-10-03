'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { countsFromAssetTypes, fleetImage, getFleetVisualType } from '@/lib/fleet-visual';

type Opportunity = {
  id: string;
  poolName: string;
  fleetType: string;
  targetAmount: number;
  raisedAmount: number;
  available: number;
  minInvestment: number;
  indicativeYield: number;
  termMonths: number | null;
  companies: number;
  assets: number;
  unitCount?: number;
  vehicles?: { type: string; units?: number }[];
  riskRating: string;
  status: string;
  reviewUrl?: string | null;
};

const money = (value: number) =>
  new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value);

function imageFor(item: Opportunity) {
  const types = (item.vehicles || []).map((vehicle) => vehicle.type);
  if (types.length === 0) return '/assets/fleet/full-mixed-fleet/card.jpg';
  return fleetImage(getFleetVisualType(countsFromAssetTypes(types)), 'card');
}

function MarketplaceContent() {
  const { data: session } = useSession();
  const search = useSearchParams();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [fleet, setFleet] = useState('ALL');
  const [open, setOpen] = useState<Opportunity | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [walletAvailable, setWalletAvailable] = useState(0);

  useEffect(() => {
    fetch('/api/marketplace/pools')
      .then((response) => response.json())
      .then((data) => {
        const pools = data.pools || [];
        setItems(pools);
        const requested = search.get('invest');
        const match = pools.find((item: Opportunity) => item.id === requested);
        if (match) {
          setOpen(match);
          setAmount(String(match.minInvestment));
        }
      })
      .catch(() => setItems([]));
  }, [search]);

  useEffect(() => {
    if (session?.user?.role === 'INVESTOR') {
      fetch('/api/investor/wallet').then((response) => response.json()).then((data) => setWalletAvailable(data.balance || 0));
    }
  }, [session]);

  const visible = useMemo(
    () => items.filter((item) => fleet === 'ALL' || item.fleetType === fleet),
    [items, fleet],
  );

  const invest = async () => {
    if (!open) return;
    const response = await fetch('/api/investor/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: open.id, amount: Number(amount || open.minInvestment) }),
    });
    const data = await response.json();
    setNote(data.error || data.message || 'Investment confirmed.');
    if (!data.error) {
      setWalletAvailable((current) => Math.max(0, current - Number(amount || open.minInvestment)));
      setItems((current) => current.map((item) => item.id === open.id
        ? { ...item, raisedAmount: item.raisedAmount + Number(amount || open.minInvestment), available: item.available - Number(amount || open.minInvestment) }
        : item));
    }
  };

  const content = (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Invest in real fleets</h1>
        <p className="mt-1 text-[#708078]">Choose a fleet, then decide how much to invest.</p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          ['ALL', 'All'],
          ['MOTORCYCLES', 'Motorcycles'],
          ['VANS', 'Vans'],
          ['SMALL_TRUCKS', 'Trucks'],
          ['MIXED', 'Mixed'],
        ].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFleet(value)} className={`rounded-full px-3 py-1.5 ${fleet === value ? 'bg-[#EAF9F1] text-[#0A4934]' : 'bg-white text-[#708078]'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((item) => {
          const units = item.unitCount || item.vehicles?.reduce((sum, vehicle) => sum + (vehicle.units || 1), 0) || item.assets;
          const progress = item.targetAmount ? Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100)) : 0;
          const canInvest = item.assets > 0 && item.available >= item.minInvestment && ['OPEN', 'PARTIALLY_FUNDED', 'FUNDING'].includes(item.status);
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-[#E5ECE8] bg-white shadow-sm">
              <img src={imageFor(item)} alt="" className="h-52 w-full object-cover" />
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{item.poolName.replace(/ Pool/g, '')}</h2>
                  <span className="rounded-full bg-[#EAF9F1] px-2.5 py-1 text-xs font-medium text-[#0A4934]">{item.riskRating || 'B'}</span>
                </div>
                <p className="text-sm text-[#708078]">{units} vehicles · {item.companies} UAE businesses</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <p><span className="block text-[#708078]">Yield</span>{item.indicativeYield}%</p>
                  <p><span className="block text-[#708078]">Term</span>{item.termMonths || '—'} mo</p>
                  <p><span className="block text-[#708078]">Minimum</span>{money(item.minInvestment)}</p>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-[#708078]">
                    <span>{money(item.available)} available</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF9F1]">
                    <div className="h-full bg-[#15C77A]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {item.reviewUrl && (
                  <a className="inline-flex text-sm font-medium text-[#0A4934] underline" href={item.reviewUrl} target="_blank" rel="noreferrer">Stellar reference</a>
                )}
                <div className="flex gap-2">
                  {canInvest ? (
                    <button type="button" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white" onClick={() => { setOpen(item); setAmount(String(item.minInvestment)); setNote(''); }}>
                      Invest now
                    </button>
                  ) : (
                    <span className="rounded-full bg-[#EDF2EF] px-4 py-2 text-sm font-semibold text-[#708078]">Fully funded</span>
                  )}
                  <Link href={`/marketplace/pools/${item.id}`} className="rounded-full border border-[#E5ECE8] px-4 py-2 text-sm">View details</Link>
                </div>
              </div>
            </article>
          );
        })}
        {visible.length === 0 && <p className="text-[#708078]">No opportunities match this filter.</p>}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">{open.poolName.replace(/ Pool/g, '')}</h2>
            <p className="mt-1 text-sm text-[#708078]">Minimum {money(open.minInvestment)} · {money(open.available)} available</p>
            <div className="mt-4 rounded-2xl border border-[#DCE6E1] bg-[#F8FBF9] p-4">
              <p className="text-xs uppercase tracking-wide text-[#708078]">Your available wallet balance</p>
              <p className="mt-1 text-2xl font-semibold">{money(walletAvailable)}</p>
            </div>
            <input className="mt-4 w-full rounded-xl border border-[#E5ECE8] px-3 py-2" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[open.minInvestment, 25000, 50000].filter((value, index, list) => value <= open.available && list.indexOf(value) === index).map((value) => (
                <button key={value} type="button" className="rounded-full bg-[#EAF9F1] px-3 py-1 text-xs text-[#0A4934]" onClick={() => setAmount(String(value))}>{money(value)}</button>
              ))}
            </div>
            {note && <p className="mt-3 text-sm text-[#0A4934]">{note}</p>}
            <div className="mt-5 flex gap-2">
              <button type="button" disabled={Number(amount) > walletAvailable || Number(amount) <= 0} className="rounded-full bg-[#0D7A52] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" onClick={invest}>Confirm investment</button>
              <Link href="/investor/wallet" className="rounded-full border border-[#E5ECE8] px-4 py-2 text-sm">Add funds</Link>
              <button type="button" className="rounded-full border border-[#E5ECE8] px-4 py-2 text-sm" onClick={() => setOpen(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (session?.user?.role === 'INVESTOR' || session?.user?.role === 'ADMIN') {
    return <DashboardLayout role={session.user.role}>{content}</DashboardLayout>;
  }
  return <main className="min-h-screen bg-[#F7FAF8] px-4 py-8 text-[#13251E] sm:px-6">{content}</main>;
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F7FAF8] px-6 py-10 text-[#708078]">Loading opportunities…</main>}>
      <MarketplaceContent />
    </Suspense>
  );
}
