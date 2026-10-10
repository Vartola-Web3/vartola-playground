import Link from 'next/link';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/docs/badge';
import { RoadmapTimeline } from '@/components/docs/roadmap';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import {
  CLOSING_LINE,
  CORE_STATEMENT,
  DISCLAIMER,
  ENTITY,
  IMPLEMENTATION,
  LIFECYCLE,
  MONEY_FLOW,
  ONCHAIN_FLOW,
  PILLARS,
  POSITIONING,
  REGULATORY_LINE,
  RISK_LAYERS,
  SOROBAN_ROLE,
  STELLAR_ROLE,
  STRUCTURE_LINE,
} from '@/lib/docs/product';

import type { Metadata } from 'next';
import { SEO } from '@/lib/docs/product';

export const metadata: Metadata = { title: SEO.pitch.title, description: SEO.pitch.description };



function Slide({ n, kicker, title, children, light = false }: { n: string; kicker: string; title: string; children: ReactNode; light?: boolean }) {
  return (
    <section
      id={`slide-${n}`}
      className={`scroll-mt-24 rounded-[28px] p-6 sm:p-10 ${light ? 'bg-[#F7FAF8] text-[#102019]' : 'border border-[rgba(112,255,184,0.14)] bg-[#0E211B]'}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${light ? 'text-[#087A50]' : 'text-[#70FFB8]'}`}>
        {n} — {kicker}
      </p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      <div className={`mt-5 text-sm leading-7 ${light ? 'text-[#3E524A]' : 'text-[#9FB8AD]'}`}>{children}</div>
    </section>
  );
}

function Cards({ items, light = false }: { items: [string, string][]; light?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([title, body]) => (
        <article key={title} className={`rounded-2xl p-4 ${light ? 'border border-[#DDE7E1] bg-white' : 'border border-white/10 bg-[#091713]'}`}>
          <h3 className={`font-semibold ${light ? 'text-[#102019]' : 'text-[#F6FFF9]'}`}>{title}</h3>
          <p className="mt-1 text-sm leading-6">{body}</p>
        </article>
      ))}
    </div>
  );
}

function Flow({ steps, vertical = false }: { steps: string[]; vertical?: boolean }) {
  return (
    <ol className={vertical ? 'mx-auto flex max-w-sm flex-col items-stretch gap-2' : 'flex flex-wrap items-center gap-2'}>
      {steps.map((step, index) => (
        <li key={step} className={vertical ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2'}>
          <span className="w-full rounded-2xl border border-[rgba(112,255,184,0.3)] bg-[#091713] px-4 py-2 text-center text-sm font-medium text-[#F6FFF9]">{step}</span>
          {index < steps.length - 1 ? <span aria-hidden className="text-[#70FFB8]">{vertical ? '↓' : '→'}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export default function PitchPage() {
  const built = IMPLEMENTATION.filter((item) => item.status === 'LIVE IN ALPHA' || item.status === 'TESTNET');
  const next = IMPLEMENTATION.filter((item) => item.status !== 'LIVE IN ALPHA' && item.status !== 'TESTNET');

  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        {/* 01 — Cover */}
        <header className="overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713]">
          <img src="/fleet/hero.jpg" alt="Commercial fleet used by operating businesses" className="h-64 w-full object-cover sm:h-80" />
          <div className="p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">01 — Vartola · Pitch · CURRENT — STELLAR TESTNET</p>
            <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">Programmable Financial Infrastructure for Productive Real-World Assets</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#9FB8AD]">Working Financial Web3 infrastructure on Stellar Testnet. Built on Stellar. Programmable through Soroban. Designed for real-world financial operations.</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#C3D1CB]">{POSITIONING} {CORE_STATEMENT}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PILLARS.map((pillar) => (
                <span key={pillar} className="rounded-full border border-[rgba(112,255,184,0.3)] px-3 py-1 text-xs text-[#D7E7DF]">{pillar}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/whitepaper" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Read the White Paper</Link>
              <Link href="/proof" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm">View Technical Proof</Link>
            </div>
          </div>
        </header>

        <Slide n="02" kicker="The problem" title="SMEs need productive assets to grow. Buying them upfront consumes the working capital they need to operate.">
          <p>Traditional financing can be slow, rigid, or inaccessible for smaller companies. Capital providers, in turn, lack efficient access to transparent, asset-linked SME opportunities.</p>
          <p className="mt-3">The ecosystem is fragmented across eight parties and processes that rarely share one record:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['SMEs', 'Capital', 'Suppliers', 'Underwriting', 'Payments', 'Asset ownership', 'Servicing', 'Recovery'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#D7E7DF]">{item}</span>
            ))}
          </div>
        </Slide>

        <Slide n="03" kicker="The solution" title="Vartola connects the complete lifecycle in one facility record.">
          <Flow steps={LIFECYCLE} />
          <p className="mt-4">One system covers origination, underwriting, funding, supplier payment, asset activation, servicing, and investor distribution. It is not a token sale, a vehicle marketplace, or a simple crowdfunding site.</p>
        </Slide>

        <Slide n="04" kicker="Why productive assets" title="The asset earns the repayment." light>
          <Cards
            light
            items={[
              ['Revenue generating', 'A delivery motorcycle, van, or truck directly supports the business that repays.'],
              ['Identifiable', 'Each asset has a VIN or serial, a registration, and an insurance policy that can be tracked.'],
              ['Recoverable', 'Commercial vehicles keep resale and recovery value.'],
              ['Observable', 'Business utility can be seen through delivery, registration, and servicing events.'],
              ['Starting market', 'Logistics: motorcycles, cargo vans, pickups, commercial vehicles, trucks, cold-chain vehicles.'],
              ['Expansion', 'Business equipment, machinery, and further productive assets.'],
            ]}
          />
        </Slide>

        <Slide n="05" kicker="Why now · Market" title="Logistics demand is visible. The financing path is not.">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#091713] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#70FFB8]">Market context</p>
              <p className="mt-2">E-commerce, last-mile delivery, distribution, and commercial mobility in the UAE and GCC depend on motorcycles, vans, trucks, and cold-chain fleets. SMEs operate a large share of those fleets and often struggle to finance them on the timeline of the contract they are trying to win.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#091713] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#70FFB8]">Vartola assumption</p>
              <p className="mt-2">A facility tied to an identifiable productive asset is easier to underwrite, service, and explain than an unsecured cash loan. The product tests this assumption; it is not a measured statistic.</p>
            </article>
          </div>
          <p className="mt-4">No market-size figure is quoted here because none is sourced in this document. Why now: the end-to-end workflow already runs, and Stellar and Soroban make a programmable settlement layer practical for installment-sized movements.</p>
        </Slide>

        <Slide n="06" kicker="How it works" title="Capital waits in escrow until the asset is ready.">
          <ol className="grid gap-3 sm:grid-cols-3">
            {MONEY_FLOW.map((step, index) => (
              <li key={step} className="rounded-2xl border border-white/10 bg-[#091713] px-4 py-3">
                <span className="text-xs text-[#70FFB8]">{String(index + 1).padStart(2, '0')}</span>
                <span className="mt-1 block font-medium text-[#F6FFF9]">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4">Reaching the funding target does not activate a facility. Release conditions, supplier payment, and delivery evidence come first.</p>
        </Slide>

        <Slide n="07" kicker="The product" title="A working platform with a separate area for each party.">
          <Cards
            items={[
              ['SME', 'Register, apply for a vehicle, upload documents, and pay the active schedule.'],
              ['Investor', 'Fund a wallet, review opportunities, participate, and receive principal and income.'],
              ['Underwriter', 'Score business, asset, and deal, then approve or reject.'],
              ['Operations / Admin', 'Create pools, run release and activation checklists, and review the operation log.'],
              ['Supplier / Partner', 'Approved payee, invoice and asset verification, delivery confirmation. A supplier portal and performance score exist; the score shows NOT ENOUGH DATA until there is real history.'],
              ['Asset lifecycle and servicing', 'Release, activation, repayment, early settlement, late, default, and recovery states.'],
            ]}
          />
        </Slide>

        <Slide n="08" kicker="Vartola Finance Engine" title="Five layers of risk, an explainable score and an Expected Loss estimate." light>
          <ul className="space-y-3">
            {RISK_LAYERS.map((layer) => (
              <li key={layer.name} className="flex flex-col gap-2 border-t border-[#DDE7E1] pt-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[#102019]">{layer.name}</p>
                  <p className="mt-1">{layer.detail}</p>
                </div>
                <StatusBadge status={layer.status} surface="light" />
              </li>
            ))}
          </ul>
        </Slide>

        <Slide n="09" kicker="Asset Passport" title="One digital lifecycle record for each financed asset.">
          <Flow steps={['Quotation', 'Invoice', 'Release', 'Delivery', 'Registration', 'Insurance', 'Servicing', 'Completion or recovery']} />
          <p className="mt-4">The passport holds the asset identity, supplier, facility, operator, and status. Private values stay off-chain. A hash and status are anchored on Soroban. The passport model and contract function exist and are published once the contracts are deployed on Testnet.</p>
        </Slide>

        <Slide n="10" kicker="Servicing, collections and treasury" title="The facility is managed after funding, not just created.">
          <Cards
            items={[
              ['Asset servicing', 'Registration, insurance, maintenance, valuation and an internal Asset Health indicator.'],
              ['Collections and recovery', 'Cases move along allowed stages with an audit trail. Lawful recovery under the applicable agreement and applicable law.'],
              ['Insurance and supplier failure', 'Claims and supplier failures are tracked; no silent change to facility terms.'],
              ['Treasury control', 'Committed, funded, released, repaid and outstanding, with chain state compared to application state.'],
              ['Reconciliation', 'Indexer and reconciliation report HEALTHY, WARNING or FAILED and never rewrite chain history.'],
              ['Operations health', 'RPC, indexer, providers and security signals in one view.'],
            ]}
          />
        </Slide>

        <Slide n="11" kicker="Proof Center" title="Verifiable without trusting Vartola." light>
          <p>The public Proof Center lists the real contracts, the VTAED test asset and three reference facilities executed on Stellar Testnet, including an early settlement and a default with recovery. Every recorded event links to the explorer. What it does not prove is stated beside it: no audit, no real money, no licence.</p>
          <Link href="/proof" className="mt-3 inline-block font-medium text-[#087A50] underline underline-offset-4">Open the Proof Center</Link>
        </Slide>

        <Slide n="12" kicker="Investor participation" title="Participation Units: a record of economic share in one facility.">
          <p>A facility is divided into Participation Units. Units determine each investor’s share of principal, income, and eligible recovery. They record economic participation. They are not legal ownership of the physical asset.</p>
          <p className="mt-3">Units are non-transferable in this phase. They are not described as sukuk, ownership tokens, or securities; any such classification requires legal approval. {STRUCTURE_LINE}</p>
        </Slide>

        <Slide n="13" kicker="Why Stellar" title="Built for assets and payments, with contracts for the rules." light>
          <p>{STELLAR_ROLE} {SOROBAN_ROLE}</p>
          <div className="mt-4">
            <Cards
              light
              items={[
                ['Stellar assets', 'Native issuance and trustlines for a settlement asset.'],
                ['Fast settlement', 'Seconds to finality for funding and installments.'],
                ['Low cost', 'Fees small enough for installment-sized movements.'],
                ['Wallet infrastructure', 'Accounts and trustlines suited to embedded wallets.'],
                ['Soroban', 'Programmable controls for escrow, release, and distribution.'],
                ['Permissioning and authorization', 'Authorization flags on assets and a registry-gated contract decide who may hold and participate.'],
                ['Stellar Asset Contract', 'A classic Stellar asset can be held and moved by Soroban contracts.'],
                ['Account-based and transparent', 'Accounts and trustlines suit embedded wallets; every settlement has a public history.'],
                ['Assets and contracts interoperate', 'Built for payment and asset-tokenization use cases on one network.'],
              ]}
            />
          </div>
        </Slide>

        <Slide n="14" kicker="On-chain financial architecture" title="Each step is a contract rule, not a database flag.">
          <Flow steps={ONCHAIN_FLOW} vertical />
          <p className="mt-4">In Alpha mode the application records a financial event only after the Soroban transaction confirms. The contracts are deployed on Stellar Testnet and Facility #001 has run end to end; the public walkthrough stays in Demo mode.</p>
          <p className="mt-3">Soroban is Stellar’s smart-contract layer. Vartola uses it for the facility lifecycle, escrow, compliance permissioning, investor participation, release conditions, repayment accounting, distribution, early settlement, default state, and recovery allocation.</p>
          <details className="mt-4 rounded-2xl border border-white/10 bg-[#091713] p-4">
            <summary className="cursor-pointer font-medium text-[#F6FFF9]">Technical detail for advanced readers</summary>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-6">
              <li><code>wallet_registry</code>: register_wallet, set_kyc_status, set_kyb_status, set_investment_limit, set_allowed_jurisdiction, suspend_wallet, is_allowed_to_invest.</li>
              <li><code>facility_contract</code>: create_facility, subscribe, reserve, cancel_reservation, refund, lock_release, attest_release_condition, authorize_release, release_supplier_payment, activate_facility, record_repayment, settle, record_recovery, calculate_waterfall, attest_risk, attest_document, upsert_passport, set_asset_status, set_role, pause, schedule_upgrade.</li>
              <li><code>finance_math</code>: integer fee, reserve, principal, income, unit, and settlement arithmetic shared by the contracts.</li>
              <li>Status: deployed and initialized on Stellar Testnet with unit tests; contract IDs are on the Technical page.</li>
            </ul>
          </details>
        </Slide>

        <Slide n="15" kicker="Web3 without crypto UX" title="Blockchain underneath. Ordinary finance on screen.">
          <Cards
            items={[
              ['Normal login', 'Email and password, with verification.'],
              ['Embedded wallet', 'Created for the user. Secret encrypted server-side.'],
              ['No seed phrases', 'Users never handle keys.'],
              ['No gas UX', 'Network fees are handled by the platform.'],
              ['Plain language', 'Cash, investments, payments, and distributions.'],
              ['External wallet', 'Optional link for advanced users later.'],
            ]}
          />
        </Slide>

        <Slide n="16" kicker="Compliance" title="Permission state on-chain. Identity data off-chain.">
          <Cards
            items={[
              ['Investors', 'Identity, sanctions, PEP, source of funds where required, eligibility, limits, jurisdiction.'],
              ['SMEs', 'Trade licence, UBO, authorized representative, directors, sanctions, business verification, credit assessment.'],
              ['Suppliers', 'KYB, payment beneficiary verification, approved supplier status.'],
            ]}
          />
          <p className="mt-4">The Soroban wallet registry stores only non-sensitive permission flags. Documents stay in private storage; only their SHA-256 fingerprints are attested on-chain. KYC provider integration exists; production screening depends on the provider contract.</p>
        </Slide>

        <Slide n="17" kicker="Business model" title="Revenue grows with financed and serviced volume." light>
          <Cards
            light
            items={[
              ['Origination / arrangement', 'On each approved facility.'],
              ['Servicing', 'Collection and distribution over the term.'],
              ['Administration', 'Facility and asset administration.'],
              ['Platform fees', 'Use of the infrastructure by partners.'],
              ['Supplier and originator partnerships', 'Asset supply and deal flow.'],
            ]}
          />
          <p className="mt-4">All fees are potential and subject to the final regulatory structure. {STRUCTURE_LINE}</p>
        </Slide>

        <Slide n="18" kicker="Defensibility" title="The moat is the full lifecycle, not one screen.">
          <div className="flex flex-wrap gap-2">
            {['Performance data', 'Underwriting models', 'Asset lifecycle records', 'Servicing operations', 'Supplier network', 'Capital network', 'Stellar infrastructure'].map((item) => (
              <span key={item} className="rounded-full border border-[rgba(112,255,184,0.3)] px-3 py-1 text-xs text-[#D7E7DF]">{item}</span>
            ))}
          </div>
          <p className="mt-4">More financed facilities produce more performance data, which improves underwriting, which supports more trusted opportunities and more capital.</p>
        </Slide>

        <Slide n="19" kicker="Regulatory path" title="Technology now. Regulated deployment after the gates.">
          <p>{REGULATORY_LINE}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Legal structure', 'Licensed-partner model where required', 'Compliance', 'Custody and payment structure', 'Security audits'].map((item) => (
              <span key={item} className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-xs text-amber-100">{item}</span>
            ))}
          </div>
          <p className="mt-4">{ENTITY.name} is a {ENTITY.form}. {ENTITY.note}</p>
        </Slide>

        <Slide n="20" kicker="Current status" title="Working on Stellar Testnet. Independent security is next." light>
          <ul className="space-y-3">
            {built.map((item) => (
              <li key={item.area} className="flex flex-col gap-2 border-t border-[#DDE7E1] pt-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[#102019]">{item.area}</p>
                  <p className="mt-1">{item.detail}</p>
                </div>
                <StatusBadge status={item.status} surface="light" />
              </li>
            ))}
          </ul>
          <p className="mt-5 font-semibold text-[#102019]">In progress and gated</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {next.map((item) => (
              <li key={item.area} className="flex items-center gap-2 rounded-full border border-[#DDE7E1] bg-white py-1 pl-3 pr-1 text-xs">
                {item.area} <StatusBadge status={item.status} surface="light" />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs">No customer count, financed volume, revenue, or assets under management is claimed.</p>
        </Slide>

        <Slide n="21" kicker="Roadmap" title="From today’s working platform to a gated Mainnet.">
          <RoadmapTimeline />
        </Slide>

        <Slide n="22" kicker="Team" title="Founder-led, with the product as evidence.">
          <Cards
            items={[
              ['Founder', `Founder-led ${ENTITY.form}, ${ENTITY.name}. The working Testnet platform shows product, fintech, and engineering capability.`],
              ['Team', 'Product and engineering are founder-led today. Named biographies are published only from verified profiles.'],
              ['External providers', 'Legal and compliance advisers are engaged as the regulatory work requires.'],
              ['Future hires', 'Soroban engineering, compliance operations, and servicing. Not presented as current employees.'],
            ]}
          />
        </Slide>

        <Slide n="23" kicker="Vision" title="From logistics assets to broader productive real-world assets.">
          <Flow steps={['Logistics assets', 'Equipment', 'Broader productive real-world assets']} />
          <p className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-[#F6FFF9]">{CLOSING_LINE}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Partner With Vartola</Link>
            <Link href="/how-it-works" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm text-[#F6FFF9]">How it works</Link>
          </div>
        </Slide>

        <p className="text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
