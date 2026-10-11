import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import SandboxClient from '@/components/sandbox/sandbox-client';

export const metadata: Metadata = {
  title: 'Interactive sandbox | Vartola',
  description: 'Run a Vartola facility lifecycle in an isolated, resettable simulation on seeded numbers. No real money, no private access.',
};

const LIFECYCLE: [string, string][] = [
  ['SME', 'Submit the financing application (150,000 over 24 months)'],
  ['Underwriter', 'Approve the facility'],
  ['Operations', 'Open the investment pool'],
  ['Investors', 'Reserve 75,000 + 45,000 + 30,000'],
  ['Operations', 'Attest the eight release conditions'],
  ['Operations', 'Release the funds to the supplier (the SME never holds the capital)'],
  ['Operations', 'Verify the six delivery checks'],
  ['Operations', 'Activate the facility — the payment schedule starts'],
  ['SME', 'Pay each installment — principal and income return to investors'],
  ['Any', 'Completed, early settlement, or default and recovery'],
];

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
            It touches no real facility, wallet or secret, and no other visitor&apos;s data. For real chain evidence open the{' '}
            <a className="text-[#70FFB8] underline underline-offset-4" href="/proof">Proof Center</a>.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 text-sm leading-7 text-[#C3D1CB]">
            <h2 className="text-lg font-semibold text-[#F6FFF9]">What this is</h2>
            <p className="mt-3">
              A playable simulation of one facility&apos;s financing lifecycle: apply, underwrite, fund, release to the
              supplier, deliver, repay and recover — using the same waterfall and rules as the platform. Every number is
              illustrative, and no real money, account or private data is involved.
            </p>
            <h3 className="mt-5 font-semibold text-[#F6FFF9]">How to play</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Pick the role the current step needs in <strong>Acting as</strong> — the &ldquo;Next step&rdquo; bar tells you which.</li>
              <li>Click the action; the timeline, ledger, investor positions and facility update.</li>
              <li>Follow the lifecycle on the right in order. Reset any time, or download the evidence at the end.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 text-sm">
            <h2 className="text-lg font-semibold text-[#F6FFF9]">The lifecycle</h2>
            <ol className="mt-3 space-y-2 text-[#C3D1CB]">
              {LIFECYCLE.map(([role, action], index) => (
                <li key={action} className="flex gap-3">
                  <span className="w-5 flex-shrink-0 text-[#70FFB8]">{index + 1}.</span>
                  <span><strong className="text-[#F6FFF9]">{role}</strong> — {action}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <SandboxClient />
      </main>
      <SiteFooter />
    </div>
  );
}
