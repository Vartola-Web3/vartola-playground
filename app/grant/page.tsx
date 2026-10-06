import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { RoadmapTimeline } from '@/components/docs/roadmap';
import { DISCLAIMER, ENTITY, GITHUB, GRANT_ASK, GRANT_MILESTONES, GRANT_OBJECTIVES, GRANT_SENTENCE, VTAED } from '@/lib/docs/product';

export default function GrantPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-8 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Stellar Community Fund</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight">Why this grant, and what it buys.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#9FB8AD]">
            Vartola already has an end-to-end Alpha for SME finance applications, underwriting, facilities, investor participation, and servicing. Grant capital accelerates the Stellar-native financial execution. It is not capital to discover whether the operating workflow works.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            ['Use of Stellar', `Stellar Testnet already holds ${VTAED.code}, a non-redeemable demonstration asset issued by ${VTAED.issuer}. Deployed Soroban contracts are the facility rulebook: permissioning, escrow, units, release, repayment, distribution, and recovery. The public walkthrough can also anchor event fingerprints. Those fingerprints do not move value.`],
            ['Integration plan', 'The registry and facility contracts are deployed on Testnet and a reviewer facility has run on VTAED. Next: index confirmed events into Prisma, reconcile, and keep Firebase as a non-blocking journal. Production later swaps the settlement asset for an approved rail without turning Vartola into an unregulated stablecoin issuer.'],
            ['Ready to build', 'The application, risk engine, servicing ledger, wallet provider, and contract sources exist. The next build is reconciliation, hardening, audit preparation, and permissioning — not a blank repository.'],
            ['Product market fit', 'The user is a UAE SME that needs a working vehicle, a supplier who can be paid against an invoice, and a capital provider who wants a facility-level record. The Alpha exercises that loop. It does not claim paying customers or financed volume.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 break-words text-sm leading-7 text-[#9FB8AD] [overflow-wrap:anywhere]">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] bg-[#F7FAF8] p-6 text-[#102019] sm:p-8">
          <h2 className="text-3xl font-semibold">Grant objectives · {GRANT_ASK}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#52635C]">{GRANT_SENTENCE}</p>
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
          <h2 className="text-2xl font-semibold">Timeline from the current Alpha</h2>
          <RoadmapTimeline />
        </section>

        <p className="text-sm leading-7 text-[#9FB8AD]">
          {ENTITY.name} will not treat a regulator’s decision as a milestone it can promise. The promised work is the technical rail, the draft legal architecture, the partner structure, and a written list of remaining gates. Repository: <a className="text-[#70FFB8] underline underline-offset-4" href={GITHUB}>{GITHUB.replace('https://', '')}</a>
        </p>
        <Link href="/technical" className="inline-block text-sm text-[#70FFB8] underline underline-offset-4">Technical architecture</Link>
        <p className="text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
