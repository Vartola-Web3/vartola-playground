import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

const facts = [
  ['Who it serves', 'UAE SMEs that need productive assets, and investors who want asset-backed income.'],
  ['Where it starts', 'Logistics fleets: motorcycles, cargo vans, pickups, and small or medium trucks.'],
  ['What comes next', 'Business equipment, after the fleet product and its controls are proven.'],
  ['What is live', 'A working demo with a facility ledger and public Stellar Testnet references.'],
];

const now = [
  ['Businesses', 'Apply for a fleet, upload evidence, and follow the review through to a lease.'],
  ['Investors', 'Browse opportunities, reserve an amount, and track income after the fleet is active.'],
  ['Evidence', 'Confirmed operations can be opened on Stellar Testnet. Personal documents stay off-chain.'],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">About</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Financing the assets that help UAE SMEs grow.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#9FB8AD]">
          Vartola connects a business that needs a productive asset with investors who fund that asset. The first market is UAE logistics. The record of each confirmed operation is meant to be visible, starting on Stellar Testnet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
            Finance your fleet
          </Link>
          <Link href="/marketplace" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm">
            Explore investments
          </Link>
        </div>

        <img src="/fleet/hero.jpg" alt="Commercial vehicles used by UAE businesses" className="mt-10 h-72 w-full rounded-[28px] object-cover sm:h-96" />

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {facts.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {now.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">Today</p>
              <h2 className="mt-2 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">Status</p>
          <h2 className="mt-2 text-2xl font-semibold">A Testnet demo, not a licensed product.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            The demo lets a business, an underwriter, and an investor walk through an application, an opportunity, funding, installments, and profit distributions. Wallet balances in the demo are virtual. When Stellar Testnet mode is on, a confirmed operation keeps a public review link. Real client money, mainnet settlement, and a regulated offer wait on licensing, custody, and security review.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/how-it-works" className="rounded-full bg-[#35F49A] px-5 py-2.5 text-sm font-semibold text-[#07120F]">
              How it works
            </Link>
            <Link href="/whitepaper" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-2.5 text-sm">
              Read the whitepaper
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
