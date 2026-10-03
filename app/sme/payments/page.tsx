'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';

type Payment = { id: string; paymentNo: number; dueDate: string; amount: number; status: string; reviewUrl?: string | null };
type FacilityPay = { id: string; facilityNo: string; description: string; monthly: number; payments: Payment[] };
type Wallet = { available: number; entries?: { id: string; type: string; amount: number; description?: string; createdAt: string; reviewUrl?: string | null }[] };

export default function SmePaymentsPage() {
  const { data: session } = useSession();
  const [facilities, setFacilities] = useState<FacilityPay[]>([]);
  const [message, setMessage] = useState('');
  const [wallet, setWallet] = useState<Wallet>({ available: 0 });
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [reference, setReference] = useState('Demo card payment');

  const load = () => fetch('/api/sme/payments').then((response) => response.json()).then((data) => {
    setFacilities(data.facilities || []);
    setWallet(data.wallet || { available: 0 });
  });
  useEffect(() => { load(); }, []);

  const pay = async (facilityId: string, amount: number, early: boolean) => {
    const response = await fetch('/api/sme/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, amount, key: `${early ? 'early' : 'pay'}:${facilityId}:${Date.now()}` }),
    });
    const data = await response.json();
    setMessage(data.error || (early ? 'Early payment recorded.' : 'Payment recorded.'));
    load();
  };

  const topUp = async () => {
    const response = await fetch('/api/sme/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'topup', amount: Number(topUpAmount), reference }),
    });
    const data = await response.json();
    setMessage(data.error || 'Demo funds added to the company wallet.');
    load();
  };

  const next = facilities
    .flatMap((facility) => facility.payments.map((payment) => ({ ...payment, facility })))
    .find((payment) => payment.status === 'UPCOMING' || payment.status === 'DUE');

  if (!session) return null;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="mx-auto max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold">Payments</h1>
        <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#708078]">Company wallet</p>
              <p className="mt-2 text-3xl font-semibold">AED {wallet.available.toLocaleString()}</p>
            </div>
            <div className="grid flex-1 gap-2 sm:max-w-xl sm:grid-cols-[1fr_1.4fr_auto]">
              <input className="rounded-xl border border-[#DCE6E1] px-3 py-2" inputMode="decimal" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} aria-label="Top-up amount" />
              <input className="rounded-xl border border-[#DCE6E1] px-3 py-2" value={reference} onChange={(event) => setReference(event.target.value)} aria-label="Payment reference" />
              <button type="button" className="rounded-xl bg-[#0D7A52] px-4 py-2 text-sm font-semibold text-white" onClick={topUp}>Add demo funds</button>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#708078]">Simulation only. Use this balance to pay scheduled installments.</p>
        </section>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#708078]">Next payment</p>
          <p className="mt-2 text-3xl font-semibold">{next ? `AED ${next.amount.toLocaleString()}` : '—'}</p>
          <p className="mt-1 text-sm text-[#708078]">{next ? `Due ${new Date(next.dueDate).toLocaleDateString()}` : 'No payment is due.'}</p>
          {next && (
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white" onClick={() => pay(next.facility.id, next.amount, false)}>Pay now</button>
              <button type="button" className="rounded-full border border-[#E5ECE8] px-4 py-2 text-sm" onClick={() => pay(next.facility.id, next.amount, true)}>Pay early</button>
            </div>
          )}
        </article>
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Payment schedule</h2>
          <div className="mt-3 space-y-2 text-sm">
            {facilities.flatMap((facility) => facility.payments).map((payment) => (
              <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5ECE8] px-3 py-2">
                <span>Installment {payment.paymentNo} · {new Date(payment.dueDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-3 text-[#708078]">
                  <span>{payment.status === 'PAID' ? 'Paid' : payment.status === 'DUE' ? 'Due' : 'Upcoming'} · AED {payment.amount.toLocaleString()}</span>
                  {payment.reviewUrl ? <a className="font-medium text-[#0A4934] underline" href={payment.reviewUrl} target="_blank" rel="noreferrer">Stellar reference</a> : <span>Stellar reference pending</span>}
                </span>
              </div>
            ))}
            {facilities.length === 0 && <p className="text-[#708078]">Payments appear after your fleet is active.</p>}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Top-ups</h2>
          <div className="mt-3 space-y-2 text-sm">
            {(wallet.entries || []).filter((entry) => entry.type === 'DEMO_TOP_UP').map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5ECE8] px-3 py-2">
                <span>{entry.description || 'Top-up'} · AED {entry.amount.toLocaleString()}</span>
                {entry.reviewUrl ? <a className="font-medium text-[#0A4934] underline" href={entry.reviewUrl} target="_blank" rel="noreferrer">Stellar reference</a> : <span className="text-[#708078]">Stellar reference pending</span>}
              </div>
            ))}
            {(wallet.entries || []).every((entry) => entry.type !== 'DEMO_TOP_UP') && <p className="text-[#708078]">No top-up yet.</p>}
          </div>
        </section>
        {message && <p className="text-sm text-[#0A4934]">{message}</p>}
      </div>
    </DashboardLayout>
  );
}
