'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const KINDS: { kind: string; label: string; fields: ('reference' | 'amount' | 'serial' | 'file')[]; help: string }[] = [
  { kind: 'INVOICE', label: 'Invoice', fields: ['reference', 'amount', 'file'], help: 'Upload the invoice for this facility. Operations verify it before any release.' },
  { kind: 'ASSET_DETAILS', label: 'Asset VIN or serial', fields: ['serial'], help: 'Only a hash of the identifier is stored for verification.' },
  { kind: 'DELIVERY_CONFIRMATION', label: 'Confirm delivery', fields: ['reference'], help: 'Confirm the asset was delivered. Operations still verify the delivery check.' },
  { kind: 'DELIVERY_EVIDENCE', label: 'Delivery evidence', fields: ['reference', 'file'], help: 'Upload a signed delivery note or photo (PDF, JPG or PNG, up to 8 MB).' },
];

export function SupplierForm({ facilityId }: { facilityId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>, kind: string) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    form.set('kind', kind);
    form.set('facilityId', facilityId);
    try {
      const response = await fetch('/api/supplier/submissions', { method: 'POST', body: form });
      const data = await response.json();
      if (response.ok) {
        setMessage('Submitted. Operations will review it.');
        (event.target as HTMLFormElement).reset();
        router.refresh();
      } else setMessage(data.error || 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {KINDS.map((item) => (
        <form key={item.kind} onSubmit={(event) => submit(event, item.kind)} className="space-y-3 rounded-2xl border border-[#E5ECE8] bg-white p-4">
          <h2 className="font-semibold">{item.label}</h2>
          <p className="text-xs text-[#708078]">{item.help}</p>
          {item.fields.includes('reference') ? <input name="reference" placeholder="Reference" className="h-10 w-full rounded-lg border border-[#DCE6E1] px-3 text-sm" /> : null}
          {item.fields.includes('amount') ? <input name="amount" type="number" step="0.01" min="0" placeholder="Amount (VTAED)" className="h-10 w-full rounded-lg border border-[#DCE6E1] px-3 text-sm" /> : null}
          {item.fields.includes('serial') ? <input name="serial" placeholder="VIN or serial number" className="h-10 w-full rounded-lg border border-[#DCE6E1] px-3 text-sm" /> : null}
          {item.fields.includes('file') ? <input name="file" type="file" accept="application/pdf,image/png,image/jpeg" className="text-sm" /> : null}
          <button type="submit" disabled={busy} className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Submit</button>
        </form>
      ))}
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
