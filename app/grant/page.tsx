import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { RoadmapTimeline } from '@/components/docs/roadmap';
import { DISCLAIMER, ENTITY, GITHUB, GRANT_ASK, GRANT_MILESTONES, GRANT_OBJECTIVES, GRANT_SENTENCE, SEO, VTAED } from '@/lib/docs/product';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: SEO.grant.title, description: SEO.grant.description };

export default function GrantPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-8 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Stellar ecosystem support · Grant brief</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight">Built on Stellar Testnet. Ready for the next stage.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#9FB8AD]">{GRANT_SENTENCE}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            ['What exists today', 'Working Financial Web3 infrastructure on Stellar Testnet: embedded wallets and permissioning, Soroban facility contracts, programmable escrow, controlled supplier release, repayment, distribution, early settlement, default and recovery, asset servicing, risk and Expected Loss, treasury, reconciliation and a public Proof Center.'],
            ['Why Stellar matters', 'Vartola needs a settlement rail with predictable finality, a native asset and account model, issuer-controlled assets and an established payments ecosystem. It does not need a speculative token. VTAED is issued as a Testnet asset by ' + VTAED.issuer.slice(0, 8) + '… and has no monetary value.'],
            ['Why Soroban is necessary', 'Facility rules must be code, not policy: escrow, Participation Units, release conditions held by separate roles, one waterfall for repayment, settlement and recovery, and events anyone can verify. A private database cannot give an outsider that assurance.'],
            ['What has been proven', 'Three reference facilities ran end to end on contracts v3, including an early settlement and a default with recovery, with reconciliation HEALTHY. Every transaction is listed on the Proof Center. Nothing is audited and no customer volume is claimed.'],
            ['What remains before production', 'Independent security validation, a regulated operating structure, production financial rails, a controlled real-world pilot and only then a controlled Mainnet step. No Mainnet date is promised.'],
            ['What ecosystem funding accelerates', 'The transition from working Stellar Testnet infrastructure to independently audited, regulated and production-connected financial infrastructure. The detailed budget is shared privately with reviewers.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 break-words text-sm leading-7 text-[#9FB8AD] [overflow-wrap:anywhere]">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] bg-[#F7FAF8] p-6 text-[#102019] sm:p-8">
          <h2 className="text-3xl font-semibold">Ecosystem support · {GRANT_ASK}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#52635C]">Objectives, in order of dependency. Amounts are not published here.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {GRANT_OBJECTIVES.map((item) => <li key={item} className="rounded-full border border-[#DDE7E1] bg-white px-3 py-1 text-xs">{item}</li>)}
          </ul>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {GRANT_MILESTONES.map((milestone) => (
              <article key={milestone.name} className="rounded-2xl border border-[#DDE7E1] bg-white p-4 text-sm leading-6">
                <p className="font-semibold">{milestone.name}</p>
                <p className="text-[#087A50]">{milestone.window}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-[#52635C]">{milestone.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Road from the current Testnet architecture</h2>
          <RoadmapTimeline />
        </section>

        <p className="text-sm leading-7 text-[#9FB8AD]">
          {ENTITY.name} does not treat a regulator’s decision as a milestone it can promise. The committed work is security validation, structure, rails and a written list of remaining gates. Repository: <a className="text-[#70FFB8] underline underline-offset-4" href={GITHUB}>{GITHUB.replace('https://', '')}</a>
        </p>
        <div className="flex flex-wrap gap-4 text-sm"><Link href="/proof" className="text-[#70FFB8] underline underline-offset-4">Proof Center</Link><Link href="/technical" className="text-[#70FFB8] underline underline-offset-4">Technical architecture</Link><Link href="/grant/reviewer" className="text-[#70FFB8] underline underline-offset-4">Reviewer overview</Link></div>
        <p className="text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
