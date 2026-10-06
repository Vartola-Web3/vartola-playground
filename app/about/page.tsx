import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { ASSET_CLASSES, DISCLAIMER, ENTITY } from '@/lib/docs/product';

export default function AboutPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">About</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Financing the assets that help UAE SMEs grow.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#9FB8AD]">
          Vartola is productive-asset finance infrastructure: a capital marketplace, a servicing workflow, and a Stellar and Soroban rail. {ENTITY.name} is a {ENTITY.form}. It builds the technology. It is not a licensed finance firm.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Finance a fleet</Link>
          <Link href="/marketplace" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm">Explore facilities</Link>
        </div>
        <img src="/fleet/hero.jpg" alt="Commercial vehicles used by UAE businesses" className="mt-10 h-72 w-full rounded-[28px] object-cover sm:h-96" />
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {ASSET_CLASSES.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">{title}</p>
              <p className="mt-3 text-sm leading-7 text-[#9FB8AD]">{body}</p>
            </article>
          ))}
        </section>
        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 md:p-8">
          <h2 className="text-2xl font-semibold">What is live</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            The Alpha lets a business, an underwriter, and an investor walk an application through to a facility, a participation, installments, and distributions. Balances in that public walkthrough are virtual. Stellar Testnet holds VTAED, a non-redeemable test asset, and can store event fingerprints. Soroban facility execution is written and not yet deployed. Real client money and Mainnet wait on licensing or a licensed partner, custody, audit, and approved agreements.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/how-it-works" className="rounded-full bg-[#35F49A] px-5 py-2.5 text-sm font-semibold text-[#07120F]">How it works</Link>
            <Link href="/whitepaper" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-2.5 text-sm">Whitepaper</Link>
          </div>
        </section>
        <section className="mt-8 rounded-[28px] border border-white/10 p-6">
          <h2 className="text-xl font-semibold">Company</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">{ENTITY.name}. {ENTITY.note} The product is founder-led. Named biographies and adviser lists are added only when the company publishes a verified profile.</p>
        </section>
        <p className="mt-8 text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
