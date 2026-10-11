'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AvailableAction } from '@/lib/sandbox/engine';
import type { SandboxState } from '@/lib/sandbox/state';

const SCENARIOS: [string, string][] = [
  ['normal', 'Normal facility'],
  ['early', 'Early settlement'],
  ['late', 'Late payment'],
  ['default', 'Default and recovery'],
  ['supplier', 'Supplier failure'],
  ['insurance', 'Insurance event'],
];

const ROLES = ['SME', 'INVESTOR', 'UNDERWRITER', 'OPERATIONS', 'SUPPLIER'] as const;

const STEPS = ['APPLICATION', 'UNDER_REVIEW', 'APPROVED', 'POOL_OPEN', 'RELEASE_READY', 'DELIVERY_PENDING', 'ACTIVE', 'COMPLETED'];
const STEP_OF: Record<string, number> = {
  APPLICATION: 0, UNDER_REVIEW: 1, APPROVED: 2, POOL_OPEN: 3, FUNDING: 3,
  RELEASE_READY: 4, RELEASED: 5, DELIVERY_PENDING: 5, ACTIVE: 6,
  COMPLETED: 7, SETTLED: 7, DEFAULTED: 6, RECOVERED: 7,
};

const panel = 'rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4 text-xs';

function money(value: number) {
  return value.toLocaleString('en-US');
}

export default function SandboxClient() {
  const [id, setId] = useState<string | null>(null);
  const [state, setState] = useState<SandboxState | null>(null);
  const [actions, setActions] = useState<AvailableAction[]>([]);
  const [scenario, setScenario] = useState('normal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (key: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/sandbox/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scenarioKey: key }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start the sandbox');
      setId(data.id);
      setState(data.state);
      setActions(data.actions);
      setScenario(key);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start the sandbox');
    } finally {
      setBusy(false);
    }
  }, []);

  const command = useCallback(async (body: Record<string, unknown>) => {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/sandbox/session/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setState(data.state);
      setActions(data.actions);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/sandbox/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenarioKey: 'normal' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data?.state) return;
        setId(data.id);
        setState(data.state);
        setActions(data.actions);
        setScenario('normal');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const currentStep = state ? STEP_OF[state.phase] ?? 0 : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {SCENARIOS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => start(key)}
            disabled={busy}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${scenario === key ? 'border-[#70FFB8] bg-[#70FFB8]/10 text-[#F6FFF9]' : 'border-[rgba(112,255,184,0.25)] text-[#C3D1CB] hover:border-[#70FFB8]'}`}
          >
            {label}
          </button>
        ))}
        <button onClick={() => command({ reset: true })} disabled={busy || !id} className="rounded-full border border-[rgba(112,255,184,0.25)] px-3 py-1.5 text-xs text-[#C3D1CB] hover:border-[#70FFB8]">Reset</button>
        {id && <a href={`/api/sandbox/session/${id}/evidence`} className="rounded-full bg-[#15C77A] px-3 py-1.5 text-xs font-semibold text-[#07120F]">Download evidence</a>}
      </div>

      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">Acting as</span>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => command({ action: { type: 'SET_ACTOR', role } })}
            disabled={busy || !id}
            className={`rounded-full px-3 py-1 text-xs ${state?.actor === role ? 'bg-[#35F49A] font-semibold text-[#07120F]' : 'border border-[rgba(112,255,184,0.25)] text-[#C3D1CB] hover:border-[#70FFB8]'}`}
          >
            {role}
          </button>
        ))}
      </div>

      {state && (
        <>
          <ol className="flex flex-wrap gap-2 text-xs">
            {STEPS.map((step, index) => (
              <li key={step} className={`rounded-full border px-3 py-1 ${index < currentStep ? 'border-[#15C77A] text-[#70FFB8]' : index === currentStep ? 'border-[#70FFB8] bg-[#70FFB8]/10 text-[#F6FFF9]' : 'border-white/10 text-[#708078]'}`}>
                {index < currentStep ? '✓ ' : ''}{step.replaceAll('_', ' ').toLowerCase()}
              </li>
            ))}
            {['SETTLED', 'DEFAULTED', 'RECOVERED'].includes(state.phase) && <li className="rounded-full border border-[#70FFB8] px-3 py-1 text-[#F6FFF9]">{state.phase.toLowerCase()}</li>}
          </ol>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className={panel}>
              <p className="font-semibold text-[#70FFB8]">Facility</p>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Phase</dt><dd>{state.phase.replaceAll('_', ' ')}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Financing</dt><dd>{money(state.facility.financeAmount)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Term</dt><dd>{state.facility.termMonths} months</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Installment</dt><dd>{money(state.facility.monthlyPayment)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Units</dt><dd>{money(state.facility.units)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Reserve</dt><dd>{money(state.reserveBalance)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">Raised</dt><dd>{money(state.pool.raised)} / {money(state.pool.target)}</dd></div>
              </dl>
            </div>

            <div className={panel}>
              <p className="font-semibold text-[#70FFB8]">Investor positions</p>
              <table className="mt-2 w-full">
                <thead><tr className="text-left text-[#708078]"><th>Holder</th><th>Units</th><th>Principal</th><th>Income</th></tr></thead>
                <tbody>
                  {state.investors.map((investor) => (
                    <tr key={investor.id}><td>{investor.name}</td><td>{money(investor.units)}</td><td>{money(investor.principalReturned)}</td><td>{money(investor.incomeReceived)}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[#9FB8AD]">Supplier release: {money(state.supplier.wallet.available)}</p>
            </div>

            <div className={panel}>
              <p className="font-semibold text-[#70FFB8]">Timeline</p>
              <ol className="mt-2 space-y-1 max-h-56 overflow-auto">
                {state.timeline.length === 0 && <li className="text-[#708078]">No events yet.</li>}
                {state.timeline.slice().reverse().map((event, index) => (
                  <li key={`${event.at}-${index}`} className="text-[#C3D1CB]"><span className="text-[#70FFB8]">{event.type}</span> · {event.detail}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className={panel}>
              <p className="font-semibold text-[#70FFB8]">Actions for {state.actor}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.length === 0 && <p className="text-[#9FB8AD]">No action for this role at this phase. Switch role to continue.</p>}
                {actions.map((entry, index) => (
                  <button
                    key={`${entry.id}-${index}`}
                    onClick={() => command({ action: entry.action })}
                    disabled={busy || !entry.enabled}
                    title={entry.hint}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${entry.kind === 'risk' ? 'border border-orange-400/50 text-orange-200' : 'bg-[#15C77A] text-[#07120F]'} disabled:opacity-40`}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[#708078]">Clock</span>
                <button onClick={() => command({ action: { type: 'ADVANCE_TIME', days: 30 } })} disabled={busy || !id} className="rounded-full border border-[rgba(112,255,184,0.25)] px-3 py-1 text-xs text-[#C3D1CB] hover:border-[#70FFB8]">+ 1 month</button>
              </div>
            </div>

            <div className={panel}>
              <p className="font-semibold text-[#70FFB8]">Ledger</p>
              <ol className="mt-2 space-y-1 max-h-56 overflow-auto">
                {state.ledger.length === 0 && <li className="text-[#708078]">No ledger entries yet.</li>}
                {state.ledger.slice().reverse().map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="text-[#C3D1CB]">
                    <span className={entry.direction === 'IN' ? 'text-[#70FFB8]' : 'text-orange-300'}>{entry.direction}</span> {money(entry.amount)} · {entry.note}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}

      {!state && !error && <p className="text-sm text-[#9FB8AD]">Starting the sandbox…</p>}
      <p className="text-xs text-[#9FB8AD]">Illustrative numbers only. This simulation runs the platform waterfall and rules but touches no real facility, wallet or secret, and no other visitor&apos;s data. Not a forecast, an offer or a regulated product.</p>
    </div>
  );
}
