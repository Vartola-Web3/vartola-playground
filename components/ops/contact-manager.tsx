'use client';

import { useCallback, useEffect, useState } from 'react';
import { CONTACT_STATUSES } from '@/lib/contact/inquiry';

type Contact = { id: string; name: string; email: string; company: string; role: string; country: string; inquiryType: string; sizeEstimate: string; message: string; status: string; notes: string; notified: boolean; createdAt: string };

export function ContactManager() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/contacts');
    const data = await response.json();
    if (response.ok) setRows(data.contacts);
    else setError(data.error || 'Could not load');
    setLoading(false);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const patch = async (id: string, body: Record<string, string>) => {
    setError('');
    const response = await fetch('/api/admin/contacts', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'Could not update');
    else {
      setNotes((current) => ({ ...current, [id]: '' }));
      await load();
    }
  };

  const shown = rows.filter((row) => filter === 'ALL' || row.status === filter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        {['ALL', ...CONTACT_STATUSES].map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full border px-3 py-1 ${filter === status ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-300'}`}>
            {status.replaceAll('_', ' ')} ({status === 'ALL' ? rows.length : rows.filter((row) => row.status === status).length})
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : shown.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No enquiries in this view.</p> : shown.map((row) => (
        <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{row.name} <span className="font-normal text-slate-500">· {row.inquiryType}</span></p>
              <p className="text-xs text-slate-500">{row.email}{row.company ? ` · ${row.company}` : ''}{row.role ? ` · ${row.role}` : ''}{row.country ? ` · ${row.country}` : ''}{row.sizeEstimate ? ` · ${row.sizeEstimate}` : ''}</p>
              <p className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleString('en-GB')}{row.notified ? ' · email notification sent' : ''}</p>
            </div>
            <select aria-label="Status" className="h-8 rounded-lg border border-slate-300 px-2 text-xs" value={row.status} onChange={(event) => patch(row.id, { status: event.target.value })}>
              {CONTACT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
            </select>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-slate-700">{row.message}</p>
          {row.notes ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs text-slate-600">{row.notes}</p> : null}
          <div className="mt-3 flex gap-2">
            <input value={notes[row.id] || ''} onChange={(event) => setNotes({ ...notes, [row.id]: event.target.value })} placeholder="Internal note" className="h-9 flex-1 rounded-lg border border-slate-300 px-2 text-xs" />
            <button type="button" onClick={() => patch(row.id, { note: notes[row.id] || '' })} className="rounded-full bg-emerald-600 px-4 text-xs font-medium text-white">Add note</button>
          </div>
        </article>
      ))}
    </div>
  );
}
