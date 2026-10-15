'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

interface SnsWebSdkBuilder {
  withConf: (conf: { lang: string }) => SnsWebSdkBuilder;
  withOptions: (options: Record<string, unknown>) => SnsWebSdkBuilder;
  on: (event: string, handler: () => void) => SnsWebSdkBuilder;
  build: () => { launch: (selector: string) => void };
}

declare global {
  interface Window {
    snsWebSdk?: {
      init: (accessToken: string, refreshToken: () => Promise<string>) => SnsWebSdkBuilder;
    };
  }
}

type Status = {
  status: string;
  provider: string;
  providerConfigured: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: 'Not started',
  SESSION_CREATED: 'Session created',
  PENDING: 'Pending review',
  IN_REVIEW: 'In review',
  NEEDS_REVIEW: 'Needs attention',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export default function VerificationClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/compliance/session')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load verification status');
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStatus({
          status: data.compliance?.status || 'NOT_STARTED',
          provider: data.compliance?.provider || 'SIMULATION',
          providerConfigured: Boolean(data.providerConfigured),
        });
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Could not load verification status');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/compliance/session');
    if (!response.ok) throw new Error('Could not load verification status');
    const data = await response.json();
    setStatus({
      status: data.compliance?.status || 'NOT_STARTED',
      provider: data.compliance?.provider || 'SIMULATION',
      providerConfigured: Boolean(data.providerConfigured),
    });
  }, []);

  const launch = useCallback(async (token: string) => {
    if (!window.snsWebSdk) {
      setError('The verification widget failed to load. Please refresh and try again.');
      return;
    }
    setLaunched((current) => {
      if (current || !window.snsWebSdk) return current;
      const refreshToken = async () => {
        const response = await fetch('/api/compliance/session', { method: 'POST' });
        const data = await response.json();
        return data.accessToken as string;
      };
      window.snsWebSdk
        .init(token, refreshToken)
        .withConf({ lang: 'en' })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on('idCheck.onError', () => setError('The verification widget reported an error. Please try again.'))
        .build()
        .launch('#sumsub-websdk-container');
      return true;
    });
  }, []);

  const start = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const response = await fetch('/api/compliance/session', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification is not available right now');
      await launch(data.accessToken as string);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verification is not available right now');
    } finally {
      setStarting(false);
    }
  }, [launch, refresh]);

  return (
    <div className="w-full space-y-6">
      <Script src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js" strategy="lazyOnload" />
      <div>
        <h1 className="text-3xl font-semibold">Identity verification</h1>
        <p className="mt-1 text-[#708078]">
          Verify your identity once. Approval unlocks investing and financing on Vartola.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#708078]">Current status</p>
            <p className="mt-1 text-xl font-semibold">
              {status ? STATUS_LABEL[status.status] || status.status : 'Loading…'}
            </p>
            {status && !status.providerConfigured && (
              <p className="mt-1 text-sm text-[#708078]">
                The verification provider is not connected yet. Your case is recorded and will activate automatically once it is.
              </p>
            )}
          </div>
          {status?.status !== 'VERIFIED' && (
            <button
              onClick={start}
              disabled={starting || !status?.providerConfigured}
              className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {starting ? 'Starting…' : 'Start verification'}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div id="sumsub-websdk-container" className="min-h-24" />
        {!launched && (
          <p className="text-sm text-[#708078]">
            The secure verification form appears here after you press “Start verification”.
          </p>
        )}
      </section>
    </div>
  );
}
