'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FloatingFinanceCard } from './FloatingFinanceCard';
import { HeroVideoBackground } from './HeroVideoBackground';

const Hero3D = dynamic(() => import('./Hero3D').then((mod) => mod.Hero3D), { ssr: false });

const heroMode = process.env.NEXT_PUBLIC_HERO_MODE === 'video' ? 'video' : '3d';

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#040711] text-[#F8FAFC]">
      <header className={`fixed inset-x-0 top-0 z-30 transition ${scrolled ? 'border-b border-white/10 bg-[#040711]/75 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">AssetFi UAE</Link>
          <nav className="hidden items-center gap-5 text-sm text-[#94A3B8] lg:flex">
            {[
              ['Home', '/'],
              ['How It Works', '/how-it-works'],
              ['Why AssetFi', '#why'],
              ['Whitepaper', '/whitepaper'],
              ['Pitch Deck', '/pitch'],
              ['Documents', '/documents'],
              ['About', '/about'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-white">{label}</Link>
            ))}
          </nav>
          <Link href="/login" className="rounded-full bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white">Launch Demo</Link>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(59,130,246,0.25),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.14),transparent_28%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#94A3B8]">
              Built on Stellar Testnet · Demo only, no real value
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              The Future of Tokenized Asset Finance
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 max-w-xl text-lg leading-8 text-[#94A3B8]">
              AssetFi transforms real-world business assets into risk-scored, tokenized lease-to-own financing opportunities for UAE SMEs, powered by Stellar.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-medium">Launch Demo</Link>
              <Link href="/whitepaper" className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium">View Whitepaper</Link>
              <Link href="#model" className="rounded-full px-5 py-3 text-sm text-[#94A3B8]">Explore the Model</Link>
            </motion.div>
          </div>
          <div className="relative h-[460px]">
            {heroMode === 'video' ? <HeroVideoBackground /> : <Hero3D reduced={reduced} />}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <FloatingFinanceCard label="Asset" value="Commercial truck" delay={0.2} />
              <FloatingFinanceCard label="Asset value" value="AED 300,000" delay={0.3} />
              <FloatingFinanceCard label="Finance" value="AED 225,000" delay={0.4} />
              <FloatingFinanceCard label="Risk tier" value="B" delay={0.5} />
              <FloatingFinanceCard label="Term" value="36 months" delay={0.6} />
              <FloatingFinanceCard label="Network" value="Stellar testnet" delay={0.7} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#060B18]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
          {[
            ['AED 2.4M', 'Demo pipeline'],
            ['15', 'Tokenized assets'],
            ['8', 'Demo SMEs'],
            ['3', 'Financing pools'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-[#94A3B8]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="model" className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.18em] text-[#22D3EE]">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold">From a working asset to a financed facility</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {['SME applies', 'Asset and business scored', 'Facility tokenized', 'Investors fund the pool', 'Lease payments distributed'].map((step, index) => (
            <Reveal key={step}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs text-[#22D3EE]">0{index + 1}</p>
                <h3 className="mt-4 text-lg font-medium">{step}</h3>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#060B18] py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold">One physical asset. A digital financing facility.</h2>
          </Reveal>
          <div className="mt-10 grid gap-3 md:grid-cols-6">
            {['Physical asset', 'Asset registry', 'Financing facility', 'Tokenized pool', 'Investor allocation', 'Lease repayment'].map((node) => (
              <div key={node} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 text-sm">{node}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto grid max-w-6xl gap-10 px-4 py-24 md:grid-cols-2">
        <Reveal>
          <h2 className="text-4xl font-semibold">Why Stellar</h2>
          <p className="mt-4 leading-7 text-[#94A3B8]">Settlement stays fast and inexpensive, while the financing record stays programmable and visible. AssetFi uses that layer for tokenized real-world asset facilities, not for speculative coins.</p>
        </Reveal>
        <div className="grid gap-3">
          {['Fast settlement', 'Low transaction cost', 'Programmable asset finance', 'Transparent records', 'Tokenized real-world assets'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">{item}</div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B5CF6]">Reference facility</p>
            <h2 className="mt-3 text-3xl font-semibold">Gulf Logistics LLC</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                ['Asset', 'Isuzu NPR truck'],
                ['Value', 'AED 300,000'],
                ['SME contribution', 'AED 75,000'],
                ['Financing', 'AED 225,000'],
                ['Term', '36 months'],
                ['Risk', 'Tier B'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-[#94A3B8]">{label}</p>
                  <p className="mt-1 text-lg">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-[#94A3B8]">
              {['Application', 'Approved', 'Tokenized', 'Funded', 'Active'].map((stage) => (
                <span key={stage} className="rounded-full border border-white/10 px-3 py-1">{stage}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-white/10 px-4 py-20 text-center">
        <h2 className="text-4xl font-semibold">Infrastructure for tokenized SME asset finance.</h2>
        <p className="mx-auto mt-4 max-w-xl text-[#94A3B8]">A testnet demonstration for investors, partners, and reviewers. No real value is transferred.</p>
        <Link href="/login" className="mt-8 inline-flex rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-medium">Launch Demo</Link>
      </section>
    </div>
  );
}
