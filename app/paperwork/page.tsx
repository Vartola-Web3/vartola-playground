import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

const documents = [
  { title: 'Product & Operating Paper', status: 'Published', href: '/whitepaper', description: 'The commercial model, lifecycle, accounting waterfall, blockchain architecture, risks, controls, and production roadmap.' },
  { title: 'Executive Pitch', status: 'Published', href: '/pitch', description: 'A concise presentation of the market problem, product, business model, current proof, and delivery plan.' },
  { title: 'How the platform works', status: 'Published', href: '/how-it-works', description: 'The complete journey for SMEs, underwriters, investors, repayments, and proportional distributions.' },
];

const packs = [
  ['Investor pack', 'Eligibility, appropriateness, risk acknowledgement, facility disclosure, fee schedule, wallet and settlement terms.'],
  ['SME facility pack', 'Application, credit approval, finance or lease agreement, payment mandate, security, insurance, and asset evidence.'],
  ['Compliance pack', 'KYC/KYB, UBO, sanctions, PEP, source of funds, monitoring, escalation, privacy, and retention procedures.'],
  ['Operations pack', 'Client-money controls, reconciliation, custody, incident response, business continuity, complaints, arrears, and recovery.'],
  ['Technology pack', 'Architecture, ledger specification, access controls, key management, security testing, smart-contract assurance, and audit exports.'],
  ['Partner pack', 'Sumsub, Transak, Circle, Stellar, cloud, and collections due diligence, contracts, SLAs, and exit plans.'],
];

export default function PaperworkPage() {
  return <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
    <SiteNav />
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">Public document room</p>
      <div className="mt-3 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div><h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight">The paperwork behind a finance platform people can trust.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#A9BDB5]">Public product documents and the controlled paperwork path required before Vartola can move from a no-value prototype to a regulated real-money pilot.</p></div>
        <aside className="rounded-3xl border border-amber-300/20 bg-amber-100/10 p-5 text-sm leading-6 text-amber-100"><strong>Prototype status.</strong> These materials describe the proposed product and controls. They are not an offer, prospectus, legal opinion, or regulatory approval.</aside>
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">{documents.map((doc) => <Link key={doc.title} href={doc.href} className="group rounded-3xl border border-[#70FFB8]/15 bg-[#0E211B] p-6 transition hover:-translate-y-1 hover:border-[#70FFB8]/40"><span className="rounded-full bg-[#35F49A]/10 px-3 py-1 text-xs font-semibold text-[#70FFB8]">{doc.status}</span><h2 className="mt-5 text-xl font-semibold group-hover:text-[#70FFB8]">{doc.title}</h2><p className="mt-3 text-sm leading-6 text-[#9FB8AD]">{doc.description}</p><p className="mt-6 text-sm font-medium text-[#70FFB8]">Open document →</p></Link>)}</section>

      <section className="mt-12 rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">Production document register</p>
        <h2 className="mt-3 text-3xl font-semibold">Six controlled packs before real money.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">{packs.map(([title, body], index) => <article key={title} className="rounded-2xl border border-[#DDE7E1] bg-white p-5"><p className="text-xs font-semibold text-[#087A50]">{String(index + 1).padStart(2, '0')}</p><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#64756E]">{body}</p></article>)}</div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10"><h2 className="text-2xl font-semibold">Public now. Controlled before launch.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">The public papers explain the design and risks. Executed customer contracts, identity documents, credit files, keys, bank details, and partner credentials remain private and access-controlled.</p></section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0D211A] p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">Five-year capital plan · management targets</p>
        <h2 className="mt-3 text-3xl font-semibold">From a $150k build grant to regulated asset infrastructure.</h2>
        <div className="mt-8 space-y-4">{[
          ['2027', '$150k grant / pre-seed', 'Regulatory design, sandboxes, security assurance, and audited Testnet MVP.'],
          ['2028', '$1.5m seed + $2m asset capacity', 'Regulated UAE logistics pilot with ring-fenced asset funding.'],
          ['2029', '$4–5m Series A + $15m capacity', 'Multi-emirate scale and expansion into productive equipment.'],
          ['2030', '$8–10m growth + $50m capacity', 'Institutional integrations, controlled liquidity work, and GCC readiness.'],
          ['2031', 'Strategic round + $150m capacity', 'Regional productive assets and a separately authorised real-estate pilot.'],
        ].map(([year, capital, outcome]) => <div key={year} className="grid gap-2 border-b border-white/10 pb-4 md:grid-cols-[90px_230px_1fr]"><p className="font-semibold text-[#70FFB8]">{year}</p><p className="font-medium text-white">{capital}</p><p className="text-sm leading-6 text-[#9FB8AD]">{outcome}</p></div>)}</div>
        <p className="mt-6 text-xs leading-5 text-[#81988E]">Company capital and investor/warehouse asset capital are separate. Targets depend on licensing, portfolio performance, partner appetite, and formal approvals; they are not forecasts or offers.</p>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
