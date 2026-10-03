import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

const chain = [
  ['Apply', 'A UAE SME requests a productive asset, a term, and an amount.'],
  ['Score', 'Company, asset, and deal scores set the lease terms.'],
  ['Structure', 'An approved asset becomes an investment opportunity backed by its lease.'],
  ['Fund', 'Investors take a share. Capital stays reserved until the vehicles are deployed.'],
  ['Settle', 'Lease payments flow back to the investors who funded that fleet.'],
];

const deliveryPlan = [
  ['Complete', 'Simulation ledger', 'Fund wallets, invest, activate an opportunity, pay installments, and distribute returns through a deterministic facility ledger.'],
  ['Active', 'Stellar Testnet', 'Switch modes in the admin console, submit signed Testnet evidence, store real transaction hashes, and reconcile outcomes.'],
  ['Gate', 'Production readiness', 'Complete licensing, legal documents, KYC/AML, client-money controls, custody, security assurance, and regulated settlement.'],
];

const fiveYearPlan = [
  ['2027', '$150k grant / pre-seed', 'Regulatory design, partner sandboxes, security assurance and an audited Testnet evidence programme.'],
  ['2028', '$1.5m seed · $2m asset capacity', 'Launch a controlled UAE logistics programme through an authorised structure; target 20–40 productive assets.'],
  ['2029', '$4–5m Series A · $15m capacity', 'Scale across the UAE, add selected business equipment and institutionalise risk and compliance.'],
  ['2030', '$8–10m growth · $50m capacity', 'Add bank and originator integrations, prepare one GCC market and test permitted transfer infrastructure.'],
  ['2031', '$150m platform capacity', 'Regional productive assets and one separately authorised, ring-fenced real-estate tokenization pilot.'],
];

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Web3 · Real-world assets</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Productive asset finance for growing UAE SMEs.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#9FB8AD]">
          Vartola connects SMEs that need productive assets with investors seeking transparent, asset-backed income—starting with logistics fleets and expanding into business equipment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
            Launch Demo
          </Link>
          <Link href="/how-it-works" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm">
            See the flow
          </Link>
        </div>

        <img src="/fleet/hero.jpg" alt="Productive assets supporting UAE SMEs" className="mt-10 h-72 w-full rounded-[28px] object-cover sm:h-96" />

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">The gap</p>
            <h2 className="mt-2 text-2xl font-semibold">SMEs need assets. Traditional finance leaves a gap.</h2>
            <p className="mt-3 text-sm leading-6 text-[#9FB8AD]">
              Growing businesses need vehicles and equipment to serve customers and generate revenue. Vartola begins with the urgent financing gap in logistics, where the asset and its cash-generating use are easy to understand.
            </p>
          </article>
          <article className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">The protocol</p>
            <h2 className="mt-2 text-2xl font-semibold">A transparent lease around a real productive asset.</h2>
            <p className="mt-3 text-sm leading-6 text-[#9FB8AD]">
              Each opportunity is a pool of real vehicles. Investor positions, reserved capital, and lease distributions are recorded so the same asset can be funded, tracked, and paid out in the open.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">On-chain lifecycle</p>
          <h2 className="mt-2 text-3xl font-semibold">From application to distribution.</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-5">
            {chain.map(([title, body], index) => (
              <li key={title}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#35F49A] text-sm font-semibold text-[#07120F]">{index + 1}</span>
                <p className="mt-3 font-medium">{title}</p>
                <p className="mt-1 text-sm text-[#9FB8AD]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">2027–2031 capital plan</p>
          <h2 className="mt-2 text-3xl font-semibold">Company capital and asset capital stay separate.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9FB8AD]">Targets are planning assumptions, not an offer or a promise. Each launch is gated by legal classification, regulator or licensed-partner approval, security assurance and proven portfolio performance.</p>
          <div className="mt-7 grid gap-3">
            {fiveYearPlan.map(([year, capital, outcome]) => <article key={year} className="grid gap-2 rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-5 sm:grid-cols-[100px_260px_1fr] sm:items-center"><p className="text-2xl font-semibold text-[#70FFB8]">{year}</p><p className="font-medium">{capital}</p><p className="text-sm leading-6 text-[#9FB8AD]">{outcome}</p></article>)}
          </div>
          <Link href="/paperwork" className="mt-6 inline-flex rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm font-medium">Read the public paperwork</Link>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Stellar', 'Fast, low-cost settlement built for issued assets and recurring payments.'],
            ['Soroban', 'Contract logic for funding, release, and distribution across a fleet.'],
            ['Real assets', 'Motorcycles, vans, pickups, and trucks operating in the UAE.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">Proposed model</p>
          <h2 className="mt-2 text-2xl font-semibold">The platform earns on the lease, not on speculation.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Origination', '3% of the financed amount, paid by the SME after successful funding.'],
              ['Servicing', '0.75% a year on outstanding principal, charged monthly to the SME.'],
              ['Investor fee', '0% platform fee at launch; the displayed return is net of Vartola fees.'],
            ].map(([title, body]) => (
              <div key={title}>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-[#9FB8AD]">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#9FB8AD]">Simulation and Stellar Testnet prototype. Testnet records are real network transactions, but no real monetary value is transferred.</p>
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">Delivery timeline</p>
          <h2 className="mt-2 text-3xl font-semibold">Prove the money flow, then move it on-chain.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {deliveryPlan.map(([stage, title, body]) => (
              <article key={stage} className="rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#35F49A]">{stage}</p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
