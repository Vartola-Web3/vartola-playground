import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { buildScenarios } from '@/lib/finance/scenarios';

export const metadata: Metadata = { title: 'Partner sandbox | Vartola', description: 'Explore Vartola facility scenarios on seeded illustrative data. No real money, no private access.' };

const panel = 'rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6';

export default function SandboxPage() {
  const scenarios = buildScenarios();
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Partner sandbox · TESTNET · NO REAL MONEY</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Explore a facility from creation to recovery</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            Six scenarios run on seeded illustrative numbers using the same waterfall engine as the platform. They are not transactions and touch no real facility, wallet or secret. For real chain evidence open the <Link className="text-[#70FFB8] underline underline-offset-4" href="/proof">Proof Center</Link>; to operate the Demo as a role, <Link className="text-[#70FFB8] underline underline-offset-4" href="/login">launch the demo</Link>.
          </p>
        </header>
        {scenarios.map((scenario) => (
          <section key={scenario.key} id={scenario.key} className={panel}>
            <h2 className="text-xl font-semibold">{scenario.name}</h2>
            <ol className="mt-3 flex flex-wrap gap-2 text-xs">{scenario.steps.map((step, index) => <li key={step} className="rounded-full border border-white/15 px-3 py-1 text-[#C3D1CB]"><span className="text-[#70FFB8]">{index + 1}.</span> {step}</li>)}</ol>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4 text-xs md:col-span-2">
                <p className="font-semibold text-[#70FFB8]">Financial state</p>
                <dl className="mt-2 space-y-1">{Object.entries(scenario.financial).map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-[#9FB8AD]">{label}</dt><dd className="text-right">{value}</dd></div>)}</dl>
              </div>
              {[['Asset state', scenario.asset], ['Chain state', scenario.chain]].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4 text-xs"><p className="font-semibold text-[#70FFB8]">{label}</p><p className="mt-2 text-[#C3D1CB]">{value}</p></div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#9FB8AD]">Operational state: {scenario.operational}</p>
          </section>
        ))}
        <p className="text-xs text-[#9FB8AD]">Illustrative numbers only. Not a forecast, an offer or a regulated product.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
