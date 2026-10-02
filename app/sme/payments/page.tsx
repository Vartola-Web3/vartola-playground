'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';

type Payment = { id: string; paymentNo: number; dueDate: string; amount: number; status: string };
type FacilityPay = { id: string; facilityNo: string; description: string; monthly: number; payments: Payment[] };

export default function SmePaymentsPage() {
  const { data: session } = useSession();
  const [facilities, setFacilities] = useState<FacilityPay[]>([]);
  const [message, setMessage] = useState('');

  const load = () => fetch('/api/sme/payments').then((response) => response.json()).then((data) => {
    setFacilities(data.facilities || []);
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

  const next = facilities.flatMap((facility) => facility.payments.map((payment) => ({ ...payment, facility }))).find((payment) => payment.status === 'SCHEDULED' || payment.status === 'LATE');

  if (!session) return null;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="mx-auto max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold">Payments</h1>
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
              <div key={payment.id} className="flex justify-between rounded-2xl border border-[#E5ECE8] px-3 py-2">
                <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                <span className="text-[#708078]">{payment.status === 'PAID' ? 'Paid' : payment.status === 'LATE' ? 'Late' : 'Upcoming'} · AED {payment.amount.toLocaleString()}</span>
              </div>
            ))}
            {facilities.length === 0 && <p className="text-[#708078]">Payments appear after your fleet is active.</p>}
          </div>
        </section>
        {message && <p className="text-sm text-[#0A4934]">{message}</p>}
      </div>
    </DashboardLayout>
  );
}
