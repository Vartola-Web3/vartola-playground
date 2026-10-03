'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Condition = { id: string; label: string; status: string; isRequired: boolean };
type Check = { id: string; label: string; status: string };
type FacilityView = {
  facilityNo: string;
  status: string;
  financeAmount: number;
  fundedAmount: number;
  beneficiary: { legalName: string; type: string } | null;
  releaseConditions: Condition[];
  activationChecks: Check[];
  releases: { status: string } | null;
};

export default function FacilityLifecyclePage() {
  const params = useParams<{ id: string }>();
  const [facility, setFacility] = useState<FacilityView | null>(null);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('Approved supplier');
  const [amount, setAmount] = useState('12000');

  const load = () => {
    fetch(`/api/admin/facilities/${params.id}`)
      .then((response) => response.json())
      .then((data) => setFacility(data.facility));
  };
  useEffect(load, [params.id]);

  const post = async (body: object) => {
    const response = await fetch(`/api/admin/facilities/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setMessage(data.error || 'Saved');
    load();
  };

  if (!facility) return <main className="p-8">Loading facility…</main>;
  const ready = facility.status === 'READY_FOR_RELEASE';

  return (
    <main className="vartola-grid-light w-full space-y-6 p-6 text-[#10231C] lg:px-10">
      <h1 className="text-3xl font-semibold">{facility.facilityNo}</h1>
      <p>Status {facility.status}. Funded {facility.fundedAmount} of {facility.financeAmount}. Beneficiary {facility.beneficiary?.legalName || 'none'}.</p>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Approved beneficiary</h2>
        <input className="mt-2 rounded-xl border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="ml-2 rounded-full bg-[#17C978] px-4 py-2 text-white" type="button" onClick={() => post({ action: 'beneficiary', legalName: name, type: 'SUPPLIER' })}>Approve supplier</button>
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Release conditions</h2>
        <ul className="mt-3 space-y-2">
          {facility.releaseConditions.map((condition) => (
            <li key={condition.id} className="flex items-center justify-between text-sm">
              <span>{condition.status === 'VERIFIED' ? '✓' : '○'} {condition.label}</span>
              {condition.status !== 'VERIFIED' && (
                <button type="button" className="text-[#0D4D35]" onClick={() => post({ action: 'verify', conditionId: condition.id, status: 'VERIFIED' })}>Verify</button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" disabled={!ready} className="mt-4 rounded-full bg-[#0D4D35] px-4 py-2 text-white disabled:opacity-40" onClick={() => post({ action: 'release' })}>
          Release funds
        </button>
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Delivery</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {facility.activationChecks.map((check) => (
            <li key={check.id} className="flex justify-between">
              <span>{check.status === 'VERIFIED' ? '✓' : '○'} {check.label}</span>
              {check.status !== 'VERIFIED' && <button type="button" onClick={() => post({ action: 'check', checkId: check.id })}>Confirm</button>}
            </li>
          ))}
        </ul>
        <button type="button" className="mt-4 rounded-full border px-4 py-2" onClick={() => post({ action: 'activate' })}>Mark vehicles active</button>
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Repayment and recovery</h2>
        <input className="mt-2 rounded-xl border px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => post({ action: 'repay', amount: Number(amount), key: `pay:${Date.now()}` })}>Record repayment</button>
          <button type="button" onClick={() => post({ action: 'settle', amount: Number(amount) })}>Early settlement</button>
          <button type="button" onClick={() => post({ action: 'status', status: 'PAYMENT_LATE', reason: 'Missed due date' })}>Mark late</button>
          <button type="button" onClick={() => post({ action: 'status', status: 'DEFAULTED', reason: 'Admin default' })}>Default</button>
          <button type="button" onClick={() => post({ action: 'recover', amount: Number(amount) })}>Record recovery</button>
        </div>
      </section>
      {message && <p className="text-sm">{message}</p>}
    </main>
  );
}
