'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useApiResource } from '@/lib/hooks/use-api-resource';

export function MfaPanel() {
  const state = useApiResource<{ alpha: boolean; enrolled: boolean; pending: boolean }>('/api/admin/mfa');
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  const post = async (body: Record<string, string>) => {
    const response = await fetch('/api/admin/mfa', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: response.ok, data: await response.json() };
  };

  const begin = async () => {
    const result = await post({ action: 'begin' });
    if (result.ok) setSetup(result.data);
    else setMessage(result.data.error);
  };
  const confirm = async () => {
    const result = await post({ action: 'confirm', code });
    if (result.ok) {
      setDone(true);
      setMessage('Second factor enabled. Sign in again with your code.');
    } else setMessage(result.data.error);
  };

  const enrolled = done || state.data?.enrolled;
  return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Account security</h1>
        <p className="text-sm text-slate-600">Administrators use a time-based code from an authenticator app. In Alpha mode this is required for administrative roles. The demo quick-login accounts are not affected outside Alpha mode.</p>
        {state.loading ? <p className="text-sm">Loading…</p> : enrolled ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-900">Second factor is enabled.</p>
            {done ? <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-white">Sign out and sign in again</button> : null}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            {!setup ? (
              <button type="button" onClick={begin} className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white">Set up second factor</button>
            ) : (
              <>
                <p>Add this key to your authenticator app, then enter the 6-digit code it shows. The key is displayed once.</p>
                <p className="break-all rounded-lg bg-slate-100 p-3 font-mono text-xs">{setup.secret}</p>
                <a className="text-emerald-700 underline" href={setup.uri}>Open in authenticator app</a>
                <div className="flex gap-2">
                  <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="6-digit code" className="h-10 flex-1 rounded-lg border border-slate-300 px-3" />
                  <button type="button" onClick={confirm} className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white">Confirm</button>
                </div>
              </>
            )}
          </div>
        )}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      </div>
  );
}
