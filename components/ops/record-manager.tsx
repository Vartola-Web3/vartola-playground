'use client';

import { useCallback, useEffect, useState } from 'react';

// Generic client manager for operations records (pilots, collections cases, claims, ...). It lists records of one
// kind, creates new ones from a small field list, and moves a record to another status. Every change is audit
// logged on the server and the server enforces role and stage rules, not this component.

type Field = { name: string; label: string; type?: 'text' | 'number' | 'select' | 'textarea'; options?: string[] };
type Row = { id: string; key: string; status: string; data: Record<string, unknown>; updatedAt: string };

export function RecordManager({ kind, title, fields, statuses, keyField, summaryFields, defaultStatus }: {
  kind: string;
  title: string;
  fields: Field[];
  statuses: string[];
  keyField: string;
  summaryFields: string[];
  defaultStatus: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState(defaultStatus);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/ops-records?kind=${kind}`);
    const data = await response.json();
    if (response.ok) setRows(data.records);
    else setMessage(data.error || 'Could not load');
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const create = async () => {
    setMessage('');
    const data: Record<string, unknown> = {};
    for (const field of fields) data[field.name] = field.type === 'number' ? Number(form[field.name] || 0) : form[field.name] || '';
    const response = await fetch('/api/admin/ops-records', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, key: String(form[keyField] || kind), status, data }) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || 'Could not save');
    else {
      setForm({});
      await load();
    }
  };

  const move = async (id: string, next: string) => {
    setMessage('');
    const response = await fetch('/api/admin/ops-records', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, id, status: next }) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || 'Could not update');
    else await load();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Add {title}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="text-sm">
              <span className="text-xs text-slate-500">{field.label}</span>
              {field.type === 'select' ? (
                <select className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2" value={form[field.name] || ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}>
                  <option value="">Select</option>
                  {field.options?.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1" rows={2} value={form[field.name] || ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              ) : (
                <input type={field.type === 'number' ? 'number' : 'text'} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2" value={form[field.name] || ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              )}
            </label>
          ))}
          <label className="text-sm">
            <span className="text-xs text-slate-500">Status</span>
            <select className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2" value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
        </div>
        <button type="button" onClick={create} className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Save</button>
        {message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Records ({rows.length})</h2>
        {loading ? <p className="mt-2 text-sm text-slate-500">Loading…</p> : rows.length === 0 ? <p className="mt-2 text-sm text-slate-500">Nothing recorded yet. Only what you enter appears here.</p> : (
          <div className="mt-3 space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{row.key}</p>
                  <select aria-label="Status" className="h-8 rounded-lg border border-slate-300 px-2 text-xs" value={row.status} onChange={(event) => move(row.id, event.target.value)}>
                    {[...new Set([row.status, ...statuses])].map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                  </select>
                </div>
                <p className="mt-1 text-xs text-slate-600">{summaryFields.map((name) => (row.data[name] !== undefined && row.data[name] !== '' ? `${name}: ${String(row.data[name])}` : null)).filter(Boolean).join(' · ')}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
