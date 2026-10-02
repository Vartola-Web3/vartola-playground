'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ArchiveButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const archive = async () => {
    if (!confirm('Archive this application? The applicant will no longer see it.')) return;
    setBusy(true);
    const res = await fetch('/api/underwriting/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Could not archive');
      return;
    }
    router.push('/underwriter');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={archive}
      disabled={busy}
      className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A]"
    >
      {busy ? 'Archiving...' : 'Archive'}
    </button>
  );
}
