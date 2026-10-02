import { cn } from '@/lib/utils';

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">{eyebrow}</p>
        )}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A] md:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-[#475569] md:text-base">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wide text-[#475569]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0F172A]">{value}</p>
      {helper && <p className="mt-2 text-sm text-[#475569]">{helper}</p>}
    </div>
  );
}

export function InfoCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="border-b border-[#E2E8F0] px-6 py-4">
        <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[#475569]">{description}</p>}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'demo';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-50 text-[#1D4ED8]',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-800',
    danger: 'bg-rose-50 text-rose-700',
    demo: 'bg-[#0B1F4D] text-white',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function MetricStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#E2E8F0] md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-5 py-4">
          <dt className="text-xs text-[#475569]">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-[#0F172A]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F7F9FC] text-xs uppercase tracking-wide text-[#475569]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-[#0F172A]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[#475569]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[#0F172A]">{value}</div>
    </div>
  );
}
