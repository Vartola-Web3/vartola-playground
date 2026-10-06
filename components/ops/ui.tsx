import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import DashboardLayout from '@/components/layout/dashboard-layout';

// Shared building blocks for the institutional admin pages. Server components unless noted.

export async function AdminPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) redirect('/login');
  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {intro ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{intro}</p> : null}
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
}

const TONES: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-900',
  warn: 'bg-amber-100 text-amber-900',
  bad: 'bg-red-100 text-red-900',
  neutral: 'bg-slate-100 text-slate-700',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export const statusTone = (value: string): keyof typeof TONES => {
  if (['HEALTHY', 'COMPLETE', 'OK', 'ACTIVE', 'VERIFIED', 'ENFORCED'].includes(value)) return 'good';
  if (['WARNING', 'PARTIAL', 'WATCH', 'DEGRADED', 'READY, NOT ENFORCED'].includes(value)) return 'warn';
  if (['FAILED', 'BLOCKED', 'AT RISK', 'DOWN', 'NOT STARTED'].includes(value)) return 'bad';
  return 'neutral';
};

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

export function Table({ head, rows, empty = 'Nothing recorded yet.' }: { head: string[]; rows: ReactNode[][]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">{head.map((label) => <th key={label} className="py-2 pr-3 font-medium">{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100">{row.map((cell, i) => <td key={i} className="py-2 pr-3 align-top">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const aed = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} VTAED`;
export const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
export const TESTNET_BANNER = 'Testnet values are simulated and have no monetary value. Internal Vartola estimates are not regulated ratings.';
