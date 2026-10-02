'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 1, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const steps = [
  ['01', 'SME applies', 'A business submits the asset, contribution, and documents.'],
  ['02', 'AssetFi scores the deal', 'Company, asset, and structure become a risk tier.'],
  ['03', 'Investors fund the pool', 'Capital is allocated into the approved facility.'],
  ['04', 'Payments are distributed', 'Lease payments are recorded on Stellar.'],
];

export function FuturisticLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3B82F6]/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#22D3EE]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.12),transparent_30%)]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            AssetFi UAE
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-[#94A3B8] md:flex">
            {[
              ['/', 'Home'],
              ['/how-it-works', 'How It Works'],
              ['/whitepaper', 'Whitepaper'],
              ['/pitch', 'Pitch Deck'],
              ['/documents', 'Documents'],
              ['/about', 'About'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/login" className="rounded-full bg-[#3B82F6] px-4 py-2 text-sm font-medium shadow-[0_0_24px_rgba(59,130,246,0.45)]">
            Launch Demo
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <motion.div initial="hidden" animate="show" variants={fade}>
            <div className="inline-flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-1 text-[#22D3EE]">Built on Stellar Testnet</span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[#94A3B8]">Demo Platform · No Real Value</span>
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              The Future of Tokenized Asset Finance
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#94A3B8]">
              AssetFi transforms real-world business assets into tokenized lease-to-own financing opportunities for UAE SMEs, powered by Stellar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-medium shadow-[0_0_28px_rgba(59,130,246,0.5)]">
                Launch Demo
              </Link>
              <Link href="/whitepaper" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur">
                View Whitepaper
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-3xl border border-white/10 bg-[#0B1224]/80 p-6 shadow-[0_0_80px_rgba(59,130,246,0.18)] backdrop-blur"
            >
              <div className="flex items-center justify-between text-sm text-[#94A3B8]">
                <span>Tokenized facility</span>
                <span className="text-[#22D3EE]">Live demo</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ['Company', '74'],
                  ['Asset', '81'],
                  ['Deal', '68'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-[#94A3B8]">{label}</p>
                    <p className="mt-2 text-3xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-24 rounded-2xl bg-[linear-gradient(90deg,rgba(59,130,246,0.15),rgba(34,211,238,0.05),rgba(139,92,246,0.2))]" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-white/10 bg-[#0B1224]/90 px-4 py-3 text-sm shadow-xl backdrop-blur md:block"
            >
              <p className="text-[#94A3B8]">Settlement</p>
              <p className="font-medium text-[#22D3EE]">Stellar testnet</p>
            </motion.div>
          </motion.div>
        </section>

        <section className="grid gap-4 pb-20 md:grid-cols-4">
          {[
            ['AED 2.4M', 'Demo pipeline'],
            ['15', 'Tokenized assets'],
            ['8', 'Demo SMEs'],
            ['3', 'Financing pools'],
          ].map(([value, label]) => (
            <motion.article
              key={label}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/10 bg-[#0B1224]/80 p-5 shadow-[0_0_0_rgba(59,130,246,0)] transition-shadow hover:shadow-[0_0_32px_rgba(59,130,246,0.25)]"
            >
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-sm text-[#94A3B8]">{label}</p>
            </motion.article>
          ))}
        </section>

        <section className="pb-20">
          <h2 className="text-3xl font-semibold">What we do</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Tokenize productive assets', 'Trucks and equipment become financeable, risk-scored positions.'],
              ['Finance UAE SMEs', 'Lease-to-own structures built for operating businesses.'],
              ['Connect investors to yield', 'Pools fund real assets, with payments recorded on-ledger.'],
            ].map(([title, text]) => (
              <motion.article key={title} whileHover={{ y: -6 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map(([n, title, text]) => (
              <motion.article key={n} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade} className="rounded-3xl border border-white/10 bg-[#0B1224] p-5">
                <p className="text-sm text-[#22D3EE]">{n}</p>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 pb-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Why Stellar</h2>
            <p className="mt-4 text-[#94A3B8]">Settlement infrastructure for tokenized real-world finance, kept on testnet for this demo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Low-cost settlement', 'Asset tokenization', 'Programmable finance', 'Transparent payment records'].map((item) => (
              <div key={item} className="rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-5 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(11,18,36,0.9)_40%,rgba(139,92,246,0.18))] p-8">
            <p className="text-sm text-[#22D3EE]">Demo showcase</p>
            <h2 className="mt-2 text-3xl font-semibold">Gulf Logistics LLC</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Asset', 'Isuzu NPR Truck'],
                ['Value', 'AED 300,000'],
                ['Finance', 'AED 225,000'],
                ['Term', '36 months'],
                ['Risk tier', 'B'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-[#94A3B8]">{label}</p>
                  <p className="mt-1 text-lg font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <h2 className="text-3xl font-semibold">Documents</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Whitepaper', '/whitepaper', 'Product thesis'],
              ['Pitch Deck', '/pitch', 'Investor narrative'],
              ['Technical Overview', '/documents', 'Operating checklist'],
            ].map(([title, href, text]) => (
              <Link key={title} href={href} className="rounded-3xl border border-white/10 bg-[#0B1224] p-6 hover:border-[#3B82F6]">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[#94A3B8]">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-24 text-center">
          <h2 className="text-4xl font-semibold md:text-5xl">Explore the future of asset finance</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#94A3B8]">Open the demo and walk through origination, underwriting, and Stellar settlement.</p>
          <Link href="/login" className="mt-8 inline-flex rounded-full bg-[#3B82F6] px-8 py-3 text-sm font-medium shadow-[0_0_32px_rgba(59,130,246,0.5)]">
            Launch the Demo
          </Link>
        </section>
      </main>
    </div>
  );
}
