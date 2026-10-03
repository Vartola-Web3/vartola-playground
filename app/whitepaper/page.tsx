import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

const lifecycle = [
  ['01', 'Originate', 'The SME completes KYB, identifies the productive asset, and submits financial and operating evidence.'],
  ['02', 'Underwrite', 'Vartola reviews the business, asset, affordability, contribution, security, and proposed term.'],
  ['03', 'Fund', 'Verified investors reserve wallet capital against a clearly disclosed opportunity.'],
  ['04', 'Deploy', 'At full funding, the facility activates, the asset is procured, and capital becomes deployed.'],
  ['05', 'Service', 'Each SME installment is split into fees, principal, income, and any disclosed reserve.'],
  ['06', 'Distribute', 'Net principal and income are allocated pro rata to the investors in that facility.'],
];

const risks = [
  ['Credit & default', 'An SME may pay late or default. Asset security may not cover the full outstanding amount.'],
  ['Liquidity', 'Positions may be locked for the stated term; a secondary market is not promised.'],
  ['Asset', 'Vehicles can be damaged, stolen, depreciate faster than expected, or become hard to recover.'],
  ['Stablecoin & FX', 'A settlement token can depeg and AED conversion can add provider, spread, and counterparty risk.'],
  ['Technology', 'Wallet, smart-contract, key-management, integration, and network failures can cause loss or delay.'],
  ['Regulatory', 'The permitted structure, disclosures, investor eligibility, and distribution model may change.'],
];

const controls = [
  'KYC/KYB, sanctions, PEP, adverse-media, UBO, and source-of-funds checks before money movement.',
  'Segregated client-money records with daily provider, bank, wallet, and blockchain reconciliation.',
  'Facility-level ledger, immutable event history, idempotent payments, and four-eyes approval for sensitive actions.',
  'Asset invoice, title or registration, valuation, inspection, insurance, and security evidence linked to each facility.',
  'Privacy by design: personal and commercial documents remain off-chain; only references and proofs are recorded.',
  'Incident response, business continuity, vendor due diligence, access reviews, and independent security assurance.',
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">{children}</p>
);

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
      <SiteNav />
      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_320px] lg:py-24">
            <div>
              <SectionLabel>Vartola product paper · v1.0 · October 2026</SectionLabel>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">Infrastructure for transparent productive-asset finance.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#A9BDB5]">Vartola connects eligible investors with UAE SMEs financing revenue-producing vehicles and equipment. This paper defines the commercial model, money flow, risks, controls, and route from a deterministic ledger to regulated on-chain settlement.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Open working demo</Link>
                <Link href="/pitch" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium">Executive pitch</Link>
              </div>
            </div>
            <aside className="rounded-[28px] border border-[#70FFB8]/20 bg-[#0D211A] p-6">
              <SectionLabel>Document status</SectionLabel>
              <dl className="mt-6 space-y-5 text-sm">
                {[['Stage', 'Functional testnet prototype'], ['Initial market', 'UAE logistics SMEs'], ['Settlement', 'Simulation + Stellar Testnet']].map(([term, value]) => <div key={term}><dt className="text-[#81988E]">{term}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}
                <div><dt className="text-[#81988E]">Real-money status</dt><dd className="mt-1 font-medium text-amber-300">Not enabled</dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="hidden self-start lg:sticky lg:top-24 lg:block">
            <p className="text-xs uppercase tracking-[0.16em] text-[#70867D]">Contents</p>
            <ol className="mt-4 space-y-3 text-sm text-[#A9BDB5]">
              {['Thesis', 'Market & product', 'Lifecycle', 'Economics', 'Ledger & blockchain', 'Risk', 'Compliance', 'Roadmap', 'References'].map((item, index) => <li key={item}><a className="transition hover:text-[#70FFB8]" href={`#section-${index + 1}`}>{String(index + 1).padStart(2, '0')} · {item}</a></li>)}
            </ol>
          </nav>

          <article className="min-w-0 space-y-6 text-[#C3D1CB]">
            <section id="section-1" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">01 · Investment thesis</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Finance the asset that produces the cash flow.</h2>
              <p className="mt-5 leading-8 text-[#52635C]">Many growing SMEs need vehicles and equipment before they can earn the revenue that repays them. Vartola structures each approved requirement as a ring-fenced facility with an identified business, specified assets, fixed economics, documented underwriting, and traceable servicing.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[['Asset-backed', 'A named productive asset and evidence pack sit behind every opportunity.'], ['Facility-level', 'Funding, repayments, fees, and investor allocations never mix across facilities.'], ['Evidence-led', 'The blockchain proves events; it does not replace legal ownership or underwriting.']].map(([title, body]) => <div key={title} className="rounded-2xl border border-[#DDE7E1] bg-white p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#64756E]">{body}</p></div>)}
              </div>
            </section>

            <section id="section-2" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10">
              <SectionLabel>02 · Market & product</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Start narrow: UAE last-mile and light logistics.</h2>
              <p className="mt-5 leading-8 text-[#A9BDB5]">The initial product covers motorcycles, vans, pickups, and light trucks used by operating SMEs. Every opportunity exposes the obligor, use of funds, assets, term, minimum ticket, target return, funding progress, risk grade, payment model, evidence, and material risks before commitment.</p>
              <div className="mt-7 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><tbody className="divide-y divide-white/10">
                {[['Target facility', 'AED 100,000–500,000 initially'], ['Typical term', '12–60 months, subject to asset life and risk'], ['Investor exposure', 'Facility participation; no guaranteed return or liquidity'], ['SME obligation', 'Installments plus clearly disclosed platform fees'], ['Legal form', 'To be confirmed by licensed UAE counsel before production']].map(([label, value]) => <tr key={label}><th className="w-2/5 bg-white/[0.03] px-5 py-4 font-medium text-[#81988E]">{label}</th><td className="px-5 py-4 text-white">{value}</td></tr>)}
              </tbody></table></div>
            </section>

            <section id="section-3" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">03 · End-to-end lifecycle</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">One traceable path from application to return.</h2>
              <ol className="mt-8 grid gap-4 sm:grid-cols-2">{lifecycle.map(([number, title, body]) => <li key={number} className="rounded-2xl border border-[#DDE7E1] bg-white p-5"><span className="text-xs font-semibold text-[#087A50]">{number}</span><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#64756E]">{body}</p></li>)}</ol>
            </section>

            <section id="section-4" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10">
              <SectionLabel>04 · Economics & waterfall</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Transparent fees. No investor platform fee at launch.</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[['3.00%', 'Origination fee', 'Paid by the SME when funding succeeds.'], ['0.75% p.a.', 'Servicing fee', 'Charged monthly to the SME on outstanding principal.'], ['0.00%', 'Investor platform fee', 'The displayed investor return is net of Vartola fees.'], ['0.50%', 'Future transfer fee', 'Only if a regulated secondary-transfer feature is introduced.']].map(([value, title, body]) => <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5"><p className="text-2xl font-semibold text-[#70FFB8]">{value}</p><h3 className="mt-2 font-medium text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-[#91A79D]">{body}</p></div>)}
              </div>
              <div className="mt-6 rounded-2xl border border-[#70FFB8]/20 bg-[#70FFB8]/[0.06] p-5 text-sm leading-7 text-[#B8CCC3]">Each installment follows the disclosed order: payment-provider and network cost, platform servicing fee, required reserve, investor principal, then investor income. Reporting shows gross payment, every deduction, net distribution, paid-to-date, and remaining amounts.</div>
            </section>

            <section id="section-5" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">05 · Ledger & blockchain</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">A switchable architecture, not two different products.</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#DDE7E1] bg-white p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#087A50]">Simulation</p><h3 className="mt-2 text-lg font-semibold">Deterministic product ledger</h3><p className="mt-2 text-sm leading-6 text-[#64756E]">Virtual AED validates top-ups, reservations, deployment, installments, fees, distributions, reversals, and reporting without real value.</p></div>
                <div className="rounded-2xl border border-[#B9E8D2] bg-[#EBFBF3] p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#087A50]">Stellar Testnet</p><h3 className="mt-2 text-lg font-semibold">Real network evidence</h3><p className="mt-2 text-sm leading-6 text-[#52635C]">The same business event queues a signed Testnet transaction and stores its returned hash. Testnet tokens still have no monetary value.</p></div>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#64756E]">Production requires a regulated fiat ramp, custody or wallet design, approved stablecoin route, key controls, reconciliation, monitoring, independent security review, and regulatory permission. Sumsub is the preferred verification adapter; Transak is the initial ramp adapter; Circle is evaluated for treasury.</p>
            </section>

            <section id="section-6" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10">
              <SectionLabel>06 · Material risks</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Capital and returns are not guaranteed.</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">{risks.map(([title, body]) => <div key={title} className="border-l-2 border-[#70FFB8]/50 pl-4"><h3 className="font-medium text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-[#91A79D]">{body}</p></div>)}</div>
            </section>

            <section id="section-7" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">07 · Compliance & controls</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Licensing and legal rights come before mainnet.</h2>
              <ul className="mt-7 space-y-4">{controls.map((control) => <li key={control} className="flex gap-3 text-sm leading-7 text-[#52635C]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0ABF7C]" />{control}</li>)}</ul>
              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950"><strong>Important:</strong> this product paper is not an offer, prospectus, legal opinion, or confirmation of regulatory approval. Final structure and customer documents require qualified UAE legal and regulatory review before accepting real money.</div>
            </section>

            <section id="section-8" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10">
              <SectionLabel>08 · Delivery roadmap</SectionLabel>
              <div className="mt-7 space-y-5">{[['Complete', 'Simulation lifecycle', 'Funding, activation, installments, fees, and pro-rata distributions.'], ['Active', 'Stellar Testnet evidence', 'Admin mode switch, funded operator, real transaction hashes, and reconciliation.'], ['Next', 'Partner sandboxes', 'Sumsub verification and Transak ramp credentials, webhooks, and exception handling.'], ['Gate', 'Production readiness', 'Legal structure, permission, client-money controls, contracts, security, custody, and pilot approval.']].map(([status, title, body]) => <div key={title} className="grid gap-2 border-b border-white/10 pb-5 sm:grid-cols-[100px_180px_1fr]"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#70FFB8]">{status}</span><h3 className="font-medium text-white">{title}</h3><p className="text-sm leading-6 text-[#91A79D]">{body}</p></div>)}</div>
            </section>

            <section id="section-9" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">09 · Regulatory references</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Primary sources guiding the production gate.</h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#52635C]">
                {[['VARA activity rulebooks and risk oversight', 'https://www.vara.ae/en/news/vara-issues-updated-activity-rulebooks-to-strengthen-market-integrity-and-risk-oversight/'], ['VARA whitepaper and disclosure requirements', 'https://rulebooks.vara.ae/entiresection/11'], ['VARA real-world-asset token rules', 'https://rulebooks.vara.ae/entiresection/516'], ['DFSA crypto-token regulatory framework', 'https://www.dfsa.ae/crypto'], ['DFSA client-assets expectations', 'https://www.dfsa.ae/what-we-do/client-assets']].map(([label, href]) => <li key={href}><a className="font-medium text-[#087A50] underline underline-offset-4" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}
              </ul>
              <p className="mt-6 text-xs leading-5 text-[#788981]">Applicable regulator and permissions depend on the final entity, jurisdiction, instrument, customer, custody, and distribution structure.</p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
