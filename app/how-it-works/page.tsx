import { HowTabs } from '@/components/docs/how-tabs';
import { ExplainerVideo } from '@/components/marketing/explainer-video';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import Link from 'next/link';
import type { Metadata } from 'next';
import { DISCLAIMER, ON_CHAIN_ITEMS, PRIVATE_ITEMS, RETURNS_NOTE, ROLE_FLOWS, SEO } from '@/lib/docs/product';

export const metadata: Metadata = { title: SEO.howItWorks.title, description: SEO.howItWorks.description };

const FLOWS: [string, string, readonly string[]][] = [
  ['For SMEs', 'Request a Pilot', ROLE_FLOWS.sme],
  ['For investors', 'Partner With Vartola', ROLE_FLOWS.investor],
  ['For suppliers', 'Join Supplier Network', ROLE_FLOWS.supplier],
  ['For operations', 'View Technical Proof', ROLE_FLOWS.operations],
];
const FLOW_LINKS: Record<string, string> = { 'Request a Pilot': '/contact?type=sme', 'Partner With Vartola': '/contact?type=capital', 'Join Supplier Network': '/contact?type=supplier', 'View Technical Proof': '/proof' };

const FULL_FLOW: [string, string][] = [
  ['SME applies', 'The business requests a productive asset.'],
  ['Verification and underwriting', 'Company checks (KYC / KYB) and an underwriting review.'],
  ['Risk assessed', 'Business, asset, deal, and facility risk are reviewed.'],
  ['Facility approved', 'An approved facility is created with its payment schedule.'],
  ['Opportunity opens', 'The facility is shown to eligible investors.'],
  ['Investors participate', 'Eligible investors take Participation Units.'],
  ['Capital held in escrow', 'Funds are held for that facility only.'],
  ['Funding target reached', 'The facility is fully funded. It is not active yet.'],
  ['Release conditions checked', 'SME contribution, contracts, supplier, invoice, asset, insurance, compliance, and final approval.'],
  ['Supplier paid', 'Capital is released to the approved supplier.'],
  ['Asset delivered', 'The asset is handed to the business.'],
  ['Delivery confirmed', 'Delivery, registration, and insurance are confirmed.'],
  ['Facility active', 'The financing term starts.'],
  ['SME pays', 'Periodic payments, which can also be made early.'],
  ['Payment divided', 'Principal, investor income, platform or servicing fee, and any reserve.'],
  ['Investors paid', 'Distributions in proportion to Participation Units.'],
  ['Facility completes', 'The financed amount is fully repaid.'],
  ['Title handled', 'Asset title follows the approved legal structure.'],
];

export default function HowItWorksPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">How it works</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Financing for the vehicles and equipment businesses use to earn.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#9FB8AD]">
          A business gets the productive asset it needs and pays over time. Investors fund that facility and are paid as the business pays. The supplier is paid only when the asset is ready, not when the first investor arrives.
        </p>

        <section className="mt-10 overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B]">
          <img src="/fleet/hero.jpg" alt="UAE commercial fleet" className="h-64 w-full object-cover sm:h-80" />
          <div className="p-6 md:p-8">
            <HowTabs />
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">The full financing cycle</p>
          <h2 className="mt-2 text-2xl font-semibold">Eighteen steps, one record.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9FB8AD]">Reaching the funding target does not start the facility. The checks in step 9 and the delivery in step 12 come first.</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FULL_FLOW.map(([title, body], index) => (
              <li key={title} className={`rounded-2xl border p-4 ${index === 7 || index === 8 ? 'border-amber-200/30 bg-amber-100/5' : 'border-white/10'}`}>
                <span className="text-xs font-semibold text-[#70FFB8]">Step {index + 1}</span>
                <p className="mt-1 font-medium">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#9FB8AD]">{body}</p>
              </li>
            ))}
          </ol>
        </section>


        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {FLOWS.map(([title, cta, steps]) => (
            <article key={title} className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <ol className="mt-4 space-y-2 text-sm text-[#C3D1CB]">
                {steps.map((step, index) => <li key={step} className="flex gap-3"><span className="w-5 shrink-0 text-xs font-semibold text-[#70FFB8]">{index + 1}</span>{step}</li>)}
              </ol>
              <Link href={FLOW_LINKS[cta]} className="mt-4 inline-block text-sm font-medium text-[#70FFB8] underline underline-offset-4">{cta}</Link>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[28px] border border-[rgba(112,255,184,0.25)] bg-[#091713] p-6">
            <h2 className="text-xl font-semibold">What happens on-chain?</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#C3D1CB]">{ON_CHAIN_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-[#091713] p-6">
            <h2 className="text-xl font-semibold">What remains private?</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#C3D1CB]">{PRIVATE_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
            <p className="mt-3 text-xs text-[#9FB8AD]">Only hashes and non-sensitive permissions are anchored. Everything runs on Stellar Testnet with a test asset that has no monetary value.</p>
          </article>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['/fleet/moto.jpg', 'Last mile', 'Motorcycles and vans for delivery businesses.'],
            ['/fleet/van.jpg', 'Cargo', 'Vans and pickups for growing operators.'],
            ['/fleet/truck.jpg', 'Distribution', 'Light and medium trucks, including cold chain.'],
          ].map(([image, title, body]) => (
            <article key={title} className="overflow-hidden rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#091713]">
              <img src={image} alt="" className="h-40 w-full object-cover" />
              <div className="p-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-[#9FB8AD]">{body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Watch the cycle</h2>
          <div className="mt-4 overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)]">
            <ExplainerVideo />
          </div>
        </section>
        <p className="mt-8 rounded-2xl border border-amber-200/20 bg-amber-100/5 p-4 text-sm leading-7 text-amber-50">{RETURNS_NOTE}</p>
        <p className="mt-4 text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
