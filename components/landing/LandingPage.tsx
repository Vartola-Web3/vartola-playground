import Link from 'next/link';
import { FleetMetricStrip } from '@/components/fleet/FleetMetricStrip';
import { HeroFleetScene } from '@/components/fleet/HeroFleetScene';
import { AudiencePanel } from '@/components/landing/audience-panel';
import { HomeShowcase } from '@/components/landing/home-showcase';
import { ExplainerVideo } from '@/components/marketing/explainer-video';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { ARCHITECTURE, CONNECTS, DISCLAIMER, LIFECYCLE, NOT_CURRENT, ROADMAP, STATUS_LABELS } from '@/lib/docs/product';

const panel = 'rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8';
const card = 'rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#091713] p-5';
const kicker = 'text-xs font-semibold uppercase tracking-[0.16em] text-[#70FFB8]';
const btn = 'rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]';
const btn2 = 'rounded-full border border-[rgba(112,255,184,0.35)] px-5 py-3 text-sm text-[#F6FFF9]';

const FINANCES: [string, string][] = [
  ['Delivery motorcycles and vans', 'Last-mile and cargo operators that need working vehicles now.'],
  ['Trucks and cold-chain vehicles', 'Distribution businesses that grow with fleet capacity.'],
  ['Business equipment next', 'Equipment and machinery, each after its own legal classification.'],
];

const PILLARS: [string, string][] = [
  ['Programmable escrow', 'Investor capital is held by the facility contract. It leaves only to the approved supplier, after eight attested release conditions, authorized by one role and paid by another. The SME never receives the capital.'],
  ['Risk and underwriting', 'Business, asset, deal and facility risk with an explainable score and an internal Expected Loss estimate. Underwriters see why a score is what it is. It is not a regulated rating.'],
  ['Asset servicing', 'Each asset has a digital passport, verification checks with named sources, insurance and registration tracking, maintenance and valuation, plus collections and lawful recovery workflows.'],
  ['Investor positions', 'Participation Units give a verifiable share of principal, income and recovery in one facility, with receipts and an on-chain proof. Units record economic participation, not legal ownership of the asset.'],
];

export function LandingPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />

      <main className="vartola-frame space-y-8 py-8 pb-16">
        <HomeShowcase />

        <section className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className={kicker}>{STATUS_LABELS.current}</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
              Financing the Assets That Help <span className="text-[#35F49A]">Businesses</span> Grow.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#C5D5CC]">
              Vartola connects SME asset demand, capital, suppliers and servicing through programmable finance on Stellar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/how-it-works" className={btn}>Explore How It Works</Link>
              <Link href="/proof" className={btn2}>View Technical Proof</Link>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(112,255,184,0.25)] px-4 py-2 text-xs text-[#D7E7DF]">
              <span className="h-2 w-2 rounded-full bg-[#35F49A]" aria-hidden="true" /> Working on Stellar Testnet · test asset only · no real money
            </p>
          </div>
          <HeroFleetScene />
        </section>

        <FleetMetricStrip />

        <section className={panel}>
          <p className={kicker}>What Vartola finances</p>
          <h2 className="mt-2 text-3xl font-semibold">Productive assets that earn the repayment.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {FINANCES.map(([title, body]) => <article key={title} className={card}><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p></article>)}
          </div>
          <p className="mt-5 text-sm leading-7 text-[#9FB8AD]">One platform connects {CONNECTS.map((item) => item.toLowerCase()).join(', ')}.</p>
        </section>

        <section className={panel}>
          <p className={kicker}>How the system works</p>
          <h2 className="mt-2 text-3xl font-semibold">One facility record, from application to recovery.</h2>
          <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            {LIFECYCLE.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl border border-[rgba(112,255,184,0.3)] bg-[#091713] px-3 py-2">{step}</span>
                {index < LIFECYCLE.length - 1 ? <span className="text-[#70FFB8]" aria-hidden="true">→</span> : null}
              </li>
            ))}
          </ol>
          <div className="mt-6"><ExplainerVideo /></div>
          <Link href="/how-it-works" className="mt-4 inline-block text-sm font-medium text-[#70FFB8] underline underline-offset-4">The path for SMEs, investors, suppliers and operations</Link>
        </section>

        <section className={panel}>
          <p className={kicker}>Financial Web3 architecture</p>
          <h2 className="mt-2 text-3xl font-semibold">Stellar settles. Soroban executes. The rest supports.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {ARCHITECTURE.map((item) => <article key={item.layer} className={card}><p className="text-xs uppercase tracking-[0.14em] text-[#70FFB8]">{item.role}</p><h3 className="mt-1 font-semibold">{item.layer}</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{item.body}</p></article>)}
          </div>
          <p className="mt-5 text-sm leading-7 text-[#9FB8AD]">Flow: user action, application validation, Soroban and Stellar execution, chain confirmation, Prisma projection, Firebase operational event, reconciliation. Sensitive identity and commercial data stays off-chain; permissions, state, attestations and critical financial events are verifiable on-chain.</p>
        </section>

        <section className={panel}>
          <p className={kicker}>Why Stellar and Soroban</p>
          <h2 className="mt-2 text-3xl font-semibold">Rules as code, settlement with predictable finality.</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className={card}><h3 className="font-semibold">Stellar</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">Issuer-controlled assets, trustlines, a native account model, low fees and fast finality: a settlement rail built for payments, not a speculative token.</p></article>
            <article className={card}><h3 className="font-semibold">Soroban</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">Escrow, Participation Units, release conditions, one waterfall for repayment, settlement and recovery, and events anyone can verify. A private database cannot give an outsider that assurance.</p></article>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {PILLARS.map(([title, body]) => <article key={title} className={panel}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-[#9FB8AD]">{body}</p></article>)}
        </section>

        <section className={`${panel} border-[rgba(112,255,184,0.3)]`}>
          <p className={kicker}>Proof and verifiability</p>
          <h2 className="mt-2 text-3xl font-semibold">Verify it without trusting us.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">The Proof Center lists the real contracts, the VTAED test asset and three reference facilities executed on Stellar Testnet, including an early settlement and a default with recovery, with an explorer link for every recorded event. It also states what it does not prove: no audit, no real money, no licence.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/proof" className={btn}>View Technical Proof</Link><Link href="/technical" className={btn2}>Technical architecture</Link></div>
        </section>

        <AudiencePanel />

        <section className="grid gap-4 md:grid-cols-3">
          {([
            ['For SMEs', 'Get the vehicle or equipment you need and pay over time, with a clear schedule.', 'Request a Pilot', '/contact?type=sme'],
            ['For capital', 'Participate in one facility and follow principal, income and recovery with proof.', 'Partner With Vartola', '/contact?type=capital'],
            ['For suppliers', 'Get paid against a verified invoice and delivery, directly and on time.', 'Join Supplier Network', '/contact?type=supplier'],
          ] as const).map(([title, body, cta, href]) => (
            <article key={title} className={panel}>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#9FB8AD]">{body}</p>
              <Link href={href} className="mt-4 inline-block text-sm font-semibold text-[#70FFB8] underline underline-offset-4">{cta}</Link>
            </article>
          ))}
        </section>

        <section className={panel}>
          <p className={kicker}>Current status</p>
          <h2 className="mt-2 text-3xl font-semibold">{STATUS_LABELS.working}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className={card}><h3 className="font-semibold text-[#9DFFD2]">{STATUS_LABELS.current}</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">Wallets and permissioning, Soroban facility contracts, escrow, controlled release, repayment, distribution, settlement, default and recovery, servicing, risk, treasury, reconciliation and a public Proof Center. VTAED is a test asset with no monetary value and is not redeemable.</p></article>
            <article className={card}><h3 className="font-semibold text-amber-100">Not current</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{NOT_CURRENT.join(' · ')}.</p></article>
          </div>
        </section>

        <section className={panel}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className={kicker}>Road to Mainnet</p><h2 className="mt-2 text-3xl font-semibold">Gated, not dated.</h2></div>
            <Link href="/technical#status" className="text-sm font-medium text-[#70FFB8] underline underline-offset-4">Full roadmap</Link>
          </div>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {ROADMAP.slice(1, 7).map((item, index) => (
              <li key={item.when} className={card}>
                <span className="text-xs font-semibold text-[#35F49A]">{index + 1}</span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#70FFB8]">{item.when}</p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[linear-gradient(180deg,#0E211B,#07120F)] px-6 py-10">
          <h2 className="max-w-xl text-3xl font-semibold">Explore Vartola</h2>
          <p className="mt-3 max-w-2xl text-[#9FB8AD]">Read how it works, verify the Testnet proof, or talk to us about a pilot, supply or partnership.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/how-it-works" className={btn}>Explore Vartola</Link>
            <Link href="/proof" className={btn2}>View Technical Proof</Link>
            <Link href="/contact?type=institution" className={btn2}>Partner With Vartola</Link>
          </div>
          <p className="mt-6 text-xs leading-6 text-[#9FB8AD]">{DISCLAIMER}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
