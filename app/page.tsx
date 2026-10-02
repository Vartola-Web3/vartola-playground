import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { MetricStrip, StatCard, StatusBadge } from '@/components/ui/design';

const steps = [
  { title: 'SME applies', text: 'The business submits the asset, contribution, and supporting documents.' },
  { title: 'AssetFi scores the deal', text: 'Company, asset, and structure are scored into an institutional risk tier.' },
  { title: 'Investors fund the pool', text: 'Capital is allocated through a financing pool matched to the approved facility.' },
  { title: 'Lease payments are distributed', text: 'Scheduled payments are recorded and settled on Stellar testnet.' },
];

const modules = [
  { title: 'SME Portal', text: 'Origination, document upload, and facility tracking for UAE businesses.' },
  { title: 'Investor Portal', text: 'Pool discovery, wallet funding, and allocation into tokenized facilities.' },
  { title: 'Underwriter Dashboard', text: 'Risk review, conditions, and approval decisions in one workspace.' },
  { title: 'Stellar Settlement Layer', text: 'Simulated issuance and payment recording on Stellar testnet.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <StatusBadge tone="demo">Testnet Demo Only</StatusBadge>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-[#0B1F4D] md:text-6xl md:leading-[1.05]">
              Unlock Productive Asset Finance for UAE SMEs
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#475569] md:text-lg">
              AssetFi transforms trucks, equipment, and business assets into risk-scored, tokenized lease-to-own financing opportunities built on Stellar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-medium text-white">
                Explore Demo
              </Link>
              <Link href="/pitch" className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-medium">
                View Pitch Deck
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Underwriting preview</p>
              <StatusBadge tone="warning">Review</StatusBadge>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Company', '74'],
                ['Asset', '81'],
                ['Deal', '68'],
              ].map(([label, score]) => (
                <div key={label} className="rounded-xl bg-[#F7F9FC] p-3">
                  <p className="text-xs text-[#475569]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{score}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-[#E2E8F0] p-4 text-sm">
              <div className="flex justify-between"><span className="text-[#475569]">Facility</span><span>AED 225,000</span></div>
              <div className="mt-2 flex justify-between"><span className="text-[#475569]">Tier</span><StatusBadge tone="primary">Tier B</StatusBadge></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Demo pipeline" value="AED 2.4M" helper="Illustrative origination" />
            <StatCard label="Tokenized assets" value="15" helper="Demo inventory" />
            <StatCard label="Demo SMEs" value="8" helper="UAE operating companies" />
            <StatCard label="Financing pools" value="3" helper="Open for allocation" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-xs font-semibold text-[#1D4ED8]">0{index + 1}</p>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Platform modules</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <article key={module.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{module.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">Demo scenario</p>
                <h2 className="mt-2 text-2xl font-semibold">Gulf Logistics LLC</h2>
              </div>
              <StatusBadge tone="primary">Risk Tier B</StatusBadge>
            </div>
            <div className="mt-6">
              <MetricStrip
                items={[
                  { label: 'Asset', value: 'Isuzu NPR Truck' },
                  { label: 'Value', value: 'AED 300,000' },
                  { label: 'Finance', value: 'AED 225,000' },
                  { label: 'Term', value: '36 months' },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Whitepaper', '/whitepaper', 'Product and market thesis'],
              ['Pitch Deck', '/pitch', 'Investor narrative'],
              ['Technical Docs', '/documents', 'Operating and KYC checklist'],
            ].map(([title, href, text]) => (
              <Link key={title} href={href} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:border-[#1D4ED8]">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[#475569]">{text}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
