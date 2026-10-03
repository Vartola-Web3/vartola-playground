'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { label: string; primary: number; secondary: number };

function money(value: number) {
  return `${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(value)} AED`;
}

function EmptyChart() {
  return <div className="flex h-56 items-center justify-center rounded-2xl bg-[#F6FAF8] text-sm text-[#708078]">Activity will appear after the first completed payment.</div>;
}

export function InvestorPerformanceChart({ data }: { data: Point[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-72 w-full" aria-label="Investor cash returns over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="principalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#15C77A" stopOpacity={0.32}/><stop offset="95%" stopColor="#15C77A" stopOpacity={0}/></linearGradient>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#153F33" stopOpacity={0.22}/><stop offset="95%" stopColor="#153F33" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid stroke="#E8EFEB" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12}/><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`}/>
          <Tooltip formatter={(value) => money(Number(value))}/>
          <Area type="monotone" dataKey="primary" name="Principal returned" stroke="#15C77A" fill="url(#principalFill)" strokeWidth={3}/>
          <Area type="monotone" dataKey="secondary" name="Income received" stroke="#153F33" fill="url(#incomeFill)" strokeWidth={3}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminFinanceChart({ data }: { data: Point[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-72 w-full" aria-label="Platform collections and fees over time">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#E8EFEB" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12}/><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`}/>
          <Tooltip formatter={(value) => money(Number(value))}/>
          <Bar dataKey="primary" name="SME repayments" fill="#15C77A" radius={[8, 8, 0, 0]}/>
          <Bar dataKey="secondary" name="Platform fees" fill="#153F33" radius={[8, 8, 0, 0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
