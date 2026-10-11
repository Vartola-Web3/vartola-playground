import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import SandboxClient from '@/components/sandbox/sandbox-client';

export const metadata: Metadata = {
  title: 'Interactive sandbox | Vartola',
  description: 'Run a Vartola facility lifecycle in an isolated, resettable simulation on seeded numbers. No real money, no private access.',
};

export default function SandboxPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Interactive sandbox · TESTNET · NO REAL MONEY</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Run a facility from creation to recovery</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            An isolated, resettable simulation that uses the same waterfall engine and lifecycle rules as the platform.
            Switch roles, attest release conditions, advance time, repay the facility and download the evidence. It
            touches no real facility, wallet or secret, and no other visitor&apos;s data. For real chain evidence open the{' '}
            <a className="text-[#70FFB8] underline underline-offset-4" href="/proof">Proof Center</a>.
          </p>
        </header>
        <SandboxClient />
      </main>
      <SiteFooter />
    </div>
  );
}
