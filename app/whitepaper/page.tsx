import Link from 'next/link';
import { DocArticle } from '@/components/docs/article';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { DISCLAIMER, ENTITY } from '@/lib/docs/product';
import { WHITEPAPER_NAV, WHITEPAPER_SECTIONS } from '@/lib/docs/whitepaper';

export default function WhitepaperPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main>
        <section className="border-b border-white/10">
          <div className="vartola-frame grid gap-10 py-16 lg:grid-cols-[1fr_320px] lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">Product paper · October 2026</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                Productive-asset finance infrastructure for UAE SMEs.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#A9BDB5]">
                The authoritative description of Vartola: the financing model, servicing, ownership questions, Stellar and Soroban rail, and the gates before any live deployment. {ENTITY.name} publishes this as a technology company.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/pitch" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Read the pitch</Link>
                <Link href="/technical" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium">Technical brief</Link>
              </div>
            </div>
            <aside className="rounded-[28px] border border-[#70FFB8]/20 bg-[#0D211A] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">Document status</p>
              <dl className="mt-6 space-y-5 text-sm">
                {[
                  ['Stage', 'Working Alpha platform'],
                  ['Initial assets', 'UAE logistics and commercial fleets'],
                  ['Financial rail', 'Application ledger live; Soroban path in development'],
                  ['Test asset', 'VTAED on Stellar Testnet, no cash value'],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="text-[#81988E]">{term}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-[#81988E]">Real-money status</dt>
                  <dd className="mt-1 font-medium text-amber-200">Regulatory gate · not enabled</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>
        <div className="vartola-frame grid gap-10 py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="hidden self-start lg:sticky lg:top-24 lg:block">
            <p className="text-xs uppercase tracking-[0.16em] text-[#70867D]">Contents</p>
            <ol className="mt-4 space-y-3 text-sm text-[#A9BDB5]">
              {WHITEPAPER_NAV.map((item, index) => (
                <li key={item.id}>
                  <a className="transition hover:text-[#70FFB8]" href={`#${item.id}`}>
                    {String(index + 1).padStart(2, '0')} · {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="min-w-0">
            <DocArticle sections={WHITEPAPER_SECTIONS} />
            <p className="mt-8 text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
