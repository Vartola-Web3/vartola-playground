'use client';

import { useEffect, useState } from 'react';

type Wallet = { id: string; label: string; ownerType: string; ownerId: string; available: number; reserved: number; deployed: number };
type UserRow = { id: string; name: string; role: string; companyId?: string | null };
type ComplianceRow = { id: string; subjectId: string; subjectType: string; provider: string; status: string };

export default function SimulationTreasuryPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRow[]>([]);
  const [ownerId, setOwnerId] = useState('');
  const [amount, setAmount] = useState('100000');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const load = () => fetch('/api/admin/simulation').then((response) => response.json()).then((data) => {
    setWallets(data.wallets || []);
    setUsers(data.users || []);
    setCompliance(data.compliance || []);
    setDate(data.simulationDate || '');
  });
  useEffect(() => { load(); }, []);

  const post = async (body: object) => {
    const response = await fetch('/api/admin/simulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    setMessage(data.error || 'Saved. Settlement: Simulation Ledger. No blockchain hash.');
    load();
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 bg-[#F7FAF8] p-6 text-[#10231C]">
      <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">SIMULATION MODE · Virtual tAED — No Real Value</p>
      <h1 className="text-3xl font-semibold">Simulation treasury</h1>
      <p className="text-sm text-[#62736C]">Clock: {date ? new Date(date).toDateString() : 'today'}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 7, 30].map((days) => (
          <button key={days} type="button" className="rounded-full border bg-white px-3 py-2 text-sm" onClick={() => post({ action: 'clock', days })}>+{days} days</button>
        ))}
      </div>
      <section className="rounded-[20px] bg-white p-4">
        <h2 className="font-semibold">Add virtual funds</h2>
        <select className="mt-2 rounded-xl border px-3 py-2" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
          <option value="">Choose user</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}
        </select>
        <input className="mt-2 block rounded-xl border px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          {[100000, 500000, 1000000, 5000000].map((value) => (
            <button key={value} type="button" className="rounded-full bg-[#ECFBF3] px-3 py-1 text-xs" onClick={() => setAmount(String(value))}>{value.toLocaleString()}</button>
          ))}
        </div>
        <button type="button" className="mt-3 rounded-full bg-[#17C978] px-4 py-2 text-sm font-semibold text-white" onClick={() => post({ action: 'credit', ownerId, ownerType: users.find((user) => user.id === ownerId)?.role || 'INVESTOR', amount: Number(amount), reason: 'Demo funding', label: users.find((user) => user.id === ownerId)?.name })}>Add virtual funds</button>
      </section>
      <section className="rounded-[20px] bg-white p-4">
        <h2 className="font-semibold">KYC / KYB simulation</h2>
        <p className="mt-1 text-sm text-[#62736C]">Approve or reject a demo identity before testing funding, investment, or withdrawal.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {users.filter((user) => ['INVESTOR', 'SME'].includes(user.role)).map((user) => {
            const record = compliance.find((item) => item.subjectId === (user.role === 'SME' ? user.companyId || user.id : user.id));
            return (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E4ECE8] p-3 text-sm">
                <div><p className="font-medium">{user.name}</p><p className="text-xs text-[#62736C]">{user.role} · {record?.status || 'NOT STARTED'}</p></div>
                <div className="flex gap-1">
                  <button type="button" className="rounded-full bg-[#ECFBF3] px-3 py-1 text-xs text-[#0D4D35]" onClick={() => post({ action: 'compliance', ownerId: user.id, status: 'VERIFIED' })}>Verify</button>
                  <button type="button" className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700" onClick={() => post({ action: 'compliance', ownerId: user.id, status: 'REJECTED' })}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="space-y-2">
        {wallets.map((wallet) => (
          <article key={wallet.id} className="rounded-2xl bg-white p-4 text-sm">
            <p className="font-semibold">{wallet.label || wallet.ownerId}</p>
            <p className="text-[#62736C]">Available {wallet.available.toLocaleString()} · reserved {wallet.reserved.toLocaleString()} · deployed {wallet.deployed.toLocaleString()} tAED</p>
          </article>
        ))}
      </section>
      {message && <p className="text-sm">{message}</p>}
    </main>
  );
}
