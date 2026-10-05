import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { DISCLAIMER } from '@/lib/docs/product';
import { LEGAL_DOCS } from '@/lib/docs/legal';

const primary = [
  ['Pitch', '/pitch', 'Investor and SCF narrative, progress, and the grant ask.'],
  ['White Paper', '/whitepaper', 'The authoritative product and business document.'],
  ['How it works', '/how-it-works', 'SME, investor, and partner paths in plain language.'],
  ['Technical architecture', '/technical', 'System overview, on-chain and off-chain model, finality, and indexing.'],
  ['Stellar / Soroban', '/technical#soroban', 'Network, settlement asset, and the contracts that run the financing rules.'],
  ['Security', '/technical#security', 'Controls in place and the security gates before Mainnet.'],
  ['Compliance', '/whitepaper#kyc', 'KYC, KYB, AML, permissioning, and privacy.'],
  ['Regulatory readiness', '/whitepaper#regulation', 'Launch gates, licensed-partner strategy, and the pre-Mainnet checklist.'],
  ['Grant brief', '/grant', 'Use of Stellar, integration plan, budget, and tranches.'],
  ['Roadmap', '/technical#status', 'Implementation status and the master timeline from October 2026.'],
  ['Risk framework', '/whitepaper#underwriting', 'Five risk layers, default, recovery, and key risks.'],
  ['Legal framework', '/whitepaper#ownership', 'Ownership, Participation Units, and open legal questions.'],
  ['Terms & policies', '/legal', 'Draft legal library, subject to UAE legal and regulatory review.'],
  ['About', '/about', 'Company, asset focus, and what is live.'],
];

export default function DocsPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Documentation</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">Product, technical, and draft legal papers.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#9FB8AD]">Public papers describe the working Alpha and the Testnet rail. Draft legal documents are outlines for counsel. They are not executed agreements.</p>
        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {primary.map(([title, href, body]) => (
            <Link key={href} href={href} className="rounded-3xl border border-[#70FFB8]/15 bg-[#0E211B] p-6 hover:border-[#70FFB8]/40">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#9FB8AD]">{body}</p>
            </Link>
          ))}
        </section>
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold">Draft legal library</h2>
            <Link href="/legal" className="text-sm text-[#70FFB8]">Open the library</Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {LEGAL_DOCS.map((doc) => (
              <li key={doc.slug}>
                <Link href={`/legal/${doc.slug}`} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm hover:border-[#70FFB8]/40">{doc.title}</Link>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
